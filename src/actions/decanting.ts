'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const BulkDecantSchema = z.object({
  agencyId: z.string().min(1, 'Dealership Agency is required'),
  sourceBatchId: z.string().min(1, 'Source drum batch is required'),
  targetProductId: z.string().min(1, 'Target loose product is required'),
  drumsToDecant: z.number().int().positive('Must decant at least 1 drum'),
  notes: z.string().optional(),
  decantedById: z.string().optional(),
})

export type BulkDecantInput = z.infer<typeof BulkDecantSchema>

/**
 * Server Action: executeBulkDecanting
 * 
 * Atomically decants sealed drums (205L) into loose stock for retail bus/truck oil changes:
 * 1. Checks source batch stock and verifies dealership scoping.
 * 2. Decrements sealed drum batch stock.
 * 3. Calculates FIFO cost per liter from drum purchase rate.
 * 4. Creates or updates a loose batch with proportional FIFO cost basis.
 * 5. Logs the decanting operation to BulkDecantingLog for audit compliance.
 */
export async function executeBulkDecanting(rawInput: BulkDecantInput) {
  try {
    const data = BulkDecantSchema.parse(rawInput)
    const { agencyId, sourceBatchId, targetProductId, drumsToDecant, notes, decantedById } =
      data

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch Source Batch
      const sourceBatch = await tx.inventoryBatch.findUnique({
        where: { id: sourceBatchId },
        include: { product: true },
      })

      if (!sourceBatch) {
        throw new Error('Source drum batch not found.')
      }

      if (sourceBatch.agencyId !== agencyId) {
        throw new Error('Source batch does not belong to the selected dealership.')
      }

      if (sourceBatch.stockQuantity < drumsToDecant) {
        throw new Error(
          `Insufficient drums. Available: ${sourceBatch.stockQuantity}, Requested: ${drumsToDecant}`
        )
      }

      // Drum capacity (standard 205 Liters)
      const drumCapacityLtr = sourceBatch.product.litersPerUnit || 205.0
      const totalLitersYielded = drumsToDecant * drumCapacityLtr
      const costBasisPerLtr = sourceBatch.purchaseRate / drumCapacityLtr

      // 2. Fetch Target Loose Product
      const targetProduct = await tx.product.findUnique({
        where: { id: targetProductId },
      })

      if (!targetProduct) {
        throw new Error('Target loose product not found.')
      }

      if (targetProduct.agencyId !== agencyId) {
        throw new Error('Target loose product does not belong to this dealership.')
      }

      // 3. Decrement sealed drum batch
      await tx.inventoryBatch.update({
        where: { id: sourceBatchId },
        data: {
          stockQuantity: { decrement: drumsToDecant },
        },
      })

      // 4. Find or Create Target Loose Batch
      // We label loose batches linked to the drum batch, e.g. "LOOSE-[SourceBatchNumber]"
      const looseBatchNumber = `LOOSE-${sourceBatch.batchNumber}`
      const existingLooseBatch = await tx.inventoryBatch.findFirst({
        where: {
          agencyId,
          productId: targetProductId,
          batchNumber: looseBatchNumber,
        },
      })

      let targetBatchId: string

      if (existingLooseBatch) {
        // Increment existing loose batch
        const updated = await tx.inventoryBatch.update({
          where: { id: existingLooseBatch.id },
          data: {
            stockQuantity: { increment: totalLitersYielded },
          },
        })
        targetBatchId = updated.id
      } else {
        // Create new loose batch with matching FIFO cost
        const created = await tx.inventoryBatch.create({
          data: {
            agencyId,
            productId: targetProductId,
            batchNumber: looseBatchNumber,
            purchaseRate: costBasisPerLtr,
            tradePrice: targetProduct.litersPerUnit > 0 ? (sourceBatch.tradePrice / drumCapacityLtr) * 1.05 : costBasisPerLtr * 1.15,
            mrp: (sourceBatch.mrp / drumCapacityLtr) * 1.1,
            stockQuantity: totalLitersYielded,
            initialQuantity: totalLitersYielded,
            minAlertStock: 50, // 50 Liters alert
          },
        })
        targetBatchId = created.id
      }

      // 5. Record Decanting Log
      const log = await tx.bulkDecantingLog.create({
        data: {
          agencyId,
          sourceProductId: sourceBatch.productId,
          sourceBatchId: sourceBatch.id,
          sourceDrumsCount: drumsToDecant,
          drumCapacityLtr,
          targetProductId,
          targetBatchId,
          litersYielded: totalLitersYielded,
          costBasisPerLtr,
          notes: notes || `Decanted ${drumsToDecant} drum(s) into ${totalLitersYielded} loose liters.`,
          decantedById,
        },
      })

      return {
        logId: log.id,
        drumsDecanted: drumsToDecant,
        litersYielded: totalLitersYielded,
        looseBatchNumber,
        costBasisPerLtr,
      }
    })

    revalidatePath('/inventory')
    revalidatePath('/pos')

    return {
      success: true,
      ...result,
    }
  } catch (error: any) {
    console.error('Decanting Failed:', error)
    return {
      success: false,
      error: error?.message || 'Decanting operation failed.',
    }
  }
}
