'use server'

import { getCurrentUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import {
  getStoredPurchases,
  saveStoredPurchase,
  deleteStoredPurchase,
  StoredPurchaseOrder,
  StoredPurchaseItem,
} from '@/lib/backend-store'

export async function getPurchasesAction(agencyId?: string): Promise<StoredPurchaseOrder[]> {
  return getStoredPurchases(agencyId)
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
    currentUser.role !== UserRole.SUPER_ADMIN &&
    currentUser.role !== UserRole.AGENCY_MANAGER &&
    !currentUser.allowedAgencyIds.includes('*')
  ) {
    throw new Error('Access Denied: Only Super Admin and Agency Managers can log purchase orders.')
  }

  const totalAmount = data.items.reduce((sum, item) => sum + item.totalCost, 0)
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
    totalAmount,
    totalLiters,
    status: 'RECEIVED',
    notes: data.notes,
    items: data.items,
  }

  saveStoredPurchase(newPO)
  revalidatePath('/analytics')
  revalidatePath('/inventory')
  revalidatePath('/')
  return { success: true, purchase: newPO }
}

export async function deletePurchaseAction(id: string) {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== UserRole.SUPER_ADMIN && !currentUser.allowedAgencyIds.includes('*')) {
    throw new Error('Access Denied: Only Super Admin can delete purchase orders.')
  }

  const success = deleteStoredPurchase(id)
  revalidatePath('/analytics')
  revalidatePath('/inventory')
  revalidatePath('/')
  return { success }
}
