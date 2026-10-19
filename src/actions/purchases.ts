'use server'

import { getCurrentUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import {
  getDbPurchases,
  saveDbPurchase,
  deleteDbPurchase,
} from '@/lib/db-service'
import {
  StoredPurchaseOrder,
  StoredPurchaseItem,
} from '@/lib/backend-store'

export async function getPurchasesAction(agencyId?: string): Promise<StoredPurchaseOrder[]> {
  return getDbPurchases(agencyId)
}

export async function createPurchaseAction(data: {
  agencyId: string
  agencyCode: string
  supplierId: string
  supplierName: string
  poNumber: string
  orderDate?: string
  notes?: string
  items: StoredPurchaseItem[]
}) {
  const currentUser = await getCurrentUser()
  if (
    !currentUser ||
    (currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.AGENCY_MANAGER &&
      !currentUser.allowedAgencyIds.includes('*'))
  ) {
    throw new Error('Access Denied: Only Super Admin and Agency Managers can log purchase orders.')
  }

  const totalAmount = data.items.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0)
  const totalLiters = data.items.reduce((sum, item) => sum + item.totalLiters, 0)

  const newPO: StoredPurchaseOrder = {
    id: `po-${Date.now()}`,
    agencyId: data.agencyId,
    agencyCode: data.agencyCode,
    supplierId: data.supplierId,
    supplierName: data.supplierName,
    poNumber: data.poNumber,
    orderDate: data.orderDate || new Date().toISOString(),
    receivedDate: new Date().toISOString(),
    subtotal: totalAmount,
    transportCost: 0,
    otherExpenses: 0,
    totalAmount,
    paidAmount: totalAmount,
    dueAmount: 0,
    totalLiters,
    status: 'RECEIVED',
    paymentMethod: 'CASH',
    notes: data.notes,
    items: data.items,
  }

  const saved = await saveDbPurchase(newPO)
  revalidatePath('/analytics')
  revalidatePath('/inventory')
  revalidatePath('/')
  return { success: true, purchase: saved }
}

export async function deletePurchaseAction(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser || (currentUser.role !== UserRole.SUPER_ADMIN && !currentUser.allowedAgencyIds.includes('*'))) {
    throw new Error('Access Denied: Only Super Admin can delete purchase orders.')
  }

  const success = await deleteDbPurchase(id)
  revalidatePath('/analytics')
  revalidatePath('/inventory')
  revalidatePath('/')
  return { success }
}
