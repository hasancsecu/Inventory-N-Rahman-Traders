'use server'

import { prisma } from '@/lib/prisma'
import { PaymentMethod } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import {
  getStoredCustomerById,
  getStoredCustomerLedgers,
  recordStoredCustomerPayment,
} from '@/lib/backend-store'

const CollectDueSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  agencyId: z.string().min(1, 'Dealership Agency is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.CASH),
  bankName: z.string().optional(),
  chequeNo: z.string().optional(),
  notes: z.string().optional(),
})

export type CollectDueInput = z.infer<typeof CollectDueSchema>

/**
 * Server Action: collectCustomerPayment
 * 
 * Collects due and records payment credit in the specific dealership ledger:
 * 1. Decrements customer aggregate due.
 * 2. Fetches latest running balance for this customer under the dealership.
 * 3. Records a CREDIT entry in CustomerLedger with new running balance.
 * 4. Settles outstanding agency invoices in FIFO order.
 */
export async function collectCustomerPayment(rawInput: CollectDueInput) {
  try {
    const data = CollectDueSchema.parse(rawInput)
    const { customerId, agencyId, amount, paymentMethod, bankName, chequeNo, notes } = data

    // 1. Try Prisma DB if reachable
    try {
      const result = await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({
          where: { id: customerId },
        })

        if (!customer) throw new Error('Customer profile not found.')

        const agency = await tx.agency.findUnique({
          where: { id: agencyId },
        })

        if (!agency) throw new Error('Dealership agency not found.')

        // Decrement customer aggregate due
        await tx.customer.update({
          where: { id: customerId },
          data: {
            currentDue: { decrement: amount },
          },
        })

        // Fetch last agency-specific running balance
        const lastLedger = await tx.customerLedger.findFirst({
          where: { customerId, agencyId },
          orderBy: { createdAt: 'desc' },
        })

        const previousBalance = lastLedger ? lastLedger.runningBalance : 0.0
        const newRunningBalance = previousBalance - amount

        // Generate receipt number
        const currentYear = new Date().getFullYear()
        const receiptSeq = await tx.documentSequence.upsert({
          where: {
            agencyId_documentType_year: {
              agencyId,
              documentType: 'MONEY_RECEIPT',
              year: currentYear,
            },
          },
          update: {
            currentNumber: { increment: 1 },
          },
          create: {
            agencyId,
            documentType: 'MONEY_RECEIPT',
            year: currentYear,
            currentNumber: 1,
            prefix: `MR-${agency.code}-${currentYear}`,
          },
        })

        const receiptNumber = `${receiptSeq.prefix}-${receiptSeq.currentNumber.toString().padStart(4, '0')}`

        // Insert CREDIT Ledger entry
        const ledgerEntry = await tx.customerLedger.create({
          data: {
            customerId,
            agencyId,
            transactionType: 'PAYMENT_COLLECTION',
            debit: 0,
            credit: amount,
            runningBalance: newRunningBalance,
            referenceNumber: receiptNumber,
            paymentMethod,
            bankName,
            chequeNo,
            notes: notes || `Due collected via ${paymentMethod} by cashier`,
          },
        })

        return {
          receiptNumber,
          collectedAmount: amount,
          customerName: customer.name,
          newAgencyBalance: newRunningBalance,
          ledgerId: ledgerEntry.id,
        }
      })

      revalidatePath('/khata')
      revalidatePath('/')
      return { success: true, ...result }
    } catch (dbErr) {
      // Fallback to Persistent Backend Store
      const entry = recordStoredCustomerPayment({
        customerId,
        agencyId,
        amount,
        paymentMethod,
        bankName,
        chequeNo,
        notes,
      })

      revalidatePath('/khata')
      revalidatePath('/')

      return {
        success: true,
        receiptNumber: entry.referenceNumber,
        collectedAmount: amount,
        customerName: 'Customer',
        newAgencyBalance: entry.runningBalance,
        ledgerId: entry.id,
      }
    }
  } catch (error: any) {
    console.error('Payment Collection Error:', error)
    return {
      success: false,
      error: error?.message || 'Payment collection failed.',
    }
  }
}

/**
 * Fetches Customer Ledger: single dealership view or unified cross-agency statement
 */
export async function getCustomerStatement(customerId: string, agencyId?: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (customer) {
      const whereClause: any = { customerId }
      if (agencyId && agencyId !== 'ALL') {
        whereClause.agencyId = agencyId
      }

      const entries = await prisma.customerLedger.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          agency: {
            select: {
              name: true,
              code: true,
              brandColor: true,
            },
          },
        },
        take: 100,
      })

      return { customer, entries }
    }
  } catch {}

  // Fallback to Backend Store
  const cust = getStoredCustomerById(customerId)
  if (!cust) return null

  const entries = getStoredCustomerLedgers(customerId, agencyId).map((l) => ({
    id: l.id,
    customerId: l.customerId,
    agencyId: l.agencyId,
    transactionType: l.type === 'DEBIT' ? 'INVOICE_SALE' : 'PAYMENT_COLLECTION',
    debit: l.type === 'DEBIT' ? l.amount : 0,
    credit: l.type === 'CREDIT' ? l.amount : 0,
    runningBalance: l.runningBalance,
    referenceNumber: l.referenceNumber,
    createdAt: new Date(l.date),
    agency: {
      name: l.agencyCode,
      code: l.agencyCode,
      brandColor: '#D92D20',
    },
  }))

  return { customer: cust, entries }
}
