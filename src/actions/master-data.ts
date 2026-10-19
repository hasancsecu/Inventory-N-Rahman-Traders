'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import {
  getStoredAgencies,
  getStoredAgencyById,
  saveStoredAgency,
  deleteStoredAgency,
  getStoredProducts,
  saveStoredProduct,
  deleteStoredProduct,
  getStoredBatches,
  saveStoredBatch,
  deleteStoredBatch,
  getStoredCustomers,
  saveStoredCustomer,
  deleteStoredCustomer,
  getStoredInvoices,
  voidStoredInvoice,
  getStoredSuppliers,
  saveStoredSupplier,
  deleteStoredSupplier,
  getStoredBrands,
  saveStoredBrand,
  deleteStoredBrand,
  getStoredViscosityGrades,
  saveStoredViscosityGrade,
  deleteStoredViscosityGrade,
  getStoredPackagingTypes,
  saveStoredPackagingType,
  deleteStoredPackagingType,
  saveStoredPurchase,
  getPaginatedStoredProducts,
  getPaginatedStoredBatches,
  getPaginatedStoredAgencies,
  getPaginatedStoredBrands,
  getPaginatedStoredViscosities,
  getPaginatedStoredPackagingTypes,
  getPaginatedStoredCustomers,
  getPaginatedStoredInvoices,
  getPaginatedStoredSuppliers,
  StoredAgency,
  StoredProduct,
  StoredBatch,
  StoredCustomer,
  StoredSupplier,
  StoredBrand,
  StoredViscosityGrade,
  StoredPackagingType,
  StoredPurchaseOrder,
} from '@/lib/backend-store'

// -----------------------------------------------------------------------------
// ROLE ACCESS ASSERTION HELPERS
// -----------------------------------------------------------------------------

async function assertSuperAdmin() {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== UserRole.SUPER_ADMIN && !currentUser.allowedAgencyIds.includes('*')) {
    throw new Error(
      'Access Denied: Super Admin clearance is required to execute global master data operations.'
    )
  }
  return currentUser
}

async function assertAuthorized(allowedRoles: UserRole[], agencyId?: string) {
  const currentUser = await getCurrentUser()
  if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.allowedAgencyIds.includes('*')) {
    return currentUser
  }

  if (!allowedRoles.includes(currentUser.role)) {
    throw new Error(`Access Denied: Your role (${currentUser.role}) does not have permission for this action.`)
  }

  if (agencyId && !currentUser.allowedAgencyIds.includes(agencyId)) {
    throw new Error('Access Denied: You cannot modify records outside your authorized dealership tenancy.')
  }

  return currentUser
}

// -----------------------------------------------------------------------------
// MASTER DATA SUMMARY / STATS
// -----------------------------------------------------------------------------

export async function getMasterDataStats() {
  await assertSuperAdmin()

  const batches = getStoredBatches()
  const customers = getStoredCustomers()
  const invoices = getStoredInvoices()
  const agencies = getStoredAgencies()
  const products = getStoredProducts()
  const suppliers = getStoredSuppliers()

  const totalValuation = batches.reduce(
    (sum, b) => sum + (b.stockQuantity || 0) * (b.purchaseRate || 0),
    0
  )
  const totalDue = customers.reduce((sum, c) => sum + (c.currentDue || 0), 0)
  const totalRevenue = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0)

  return {
    totalAgencies: agencies.length,
    totalProducts: products.length,
    totalBatches: batches.length,
    totalCustomers: customers.length,
    totalInvoices: invoices.length,
    totalSuppliers: suppliers.length,
    totalBrands: getStoredBrands().length,
    totalViscosities: getStoredViscosityGrades().length,
    totalPackaging: getStoredPackagingTypes().length,
    totalInventoryValuation: Math.round(totalValuation),
    totalCustomerDue: Math.round(totalDue),
    totalInvoicedRevenue: Math.round(totalRevenue),
  }
}

// -----------------------------------------------------------------------------
// 1. AGENCY MASTER CRUD (SUPER ADMIN EXCLUSIVE)
// -----------------------------------------------------------------------------

export async function getMasterAgencies(): Promise<StoredAgency[]> {
  await assertSuperAdmin()
  return getStoredAgencies()
}

export async function createMasterAgency(data: {
  name: string
  code: string
  brandPrincipal: string
  tradeLicense: string
  binNo: string
  tinNo?: string
  phone: string
  email?: string
  address: string
  district?: string
  brandColor?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNo?: string
  bankBranch?: string
  bankRoutingNo?: string
}) {
  await assertSuperAdmin()

  const id = `agency-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newAgency: StoredAgency = {
    id,
    name: data.name,
    code: data.code.toUpperCase(),
    brandPrincipal: data.brandPrincipal,
    tradeLicense: data.tradeLicense,
    binNo: data.binNo,
    tinNo: data.tinNo || '',
    phone: data.phone,
    email: data.email || `${data.code.toLowerCase()}@lubricants-bd.com`,
    address: data.address,
    district: data.district || 'Dhaka',
    brandColor: data.brandColor || '#dc2626',
    bankName: data.bankName || 'Islami Bank Bangladesh PLC',
    bankAccountName: data.bankAccountName || data.name,
    bankAccountNo: data.bankAccountNo || '2050213020089123',
    bankBranch: data.bankBranch || 'Principal Branch',
    bankRoutingNo: data.bankRoutingNo || '125272891',
    isActive: true,
  }

  saveStoredAgency(newAgency)
  revalidatePath('/', 'layout')
  return { success: true, agency: newAgency }
}

export async function updateMasterAgency(id: string, data: Partial<StoredAgency>) {
  await assertSuperAdmin()

  const agency = getStoredAgencyById(id)
  if (!agency) return { success: false, error: 'Agency not found' }

  const updated = saveStoredAgency({ ...agency, ...data })
  revalidatePath('/', 'layout')
  return { success: true, agency: updated }
}

export async function deleteMasterAgency(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredAgency(id)
  revalidatePath('/', 'layout')
  return { success }
}

// -----------------------------------------------------------------------------
// 2. PRODUCT MASTER CRUD (SUPER ADMIN & AGENCY MANAGER)
// -----------------------------------------------------------------------------

export async function getMasterProducts(agencyId?: string) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], agencyId)
  return getStoredProducts(agencyId)
}

export async function createMasterProduct(data: {
  agencyId: string
  brand: string
  name: string
  sku: string
  viscosityGrade: string
  applicationSegment: string
  packaging: string
  uom: string
  litersPerUnit: number
  minAlertStock: number
  isDecantable?: boolean
  isLoose?: boolean
}) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], data.agencyId)

  const id = `prod-${data.sku.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newProduct: StoredProduct = {
    id,
    agencyId: data.agencyId,
    brand: data.brand,
    name: data.name,
    sku: data.sku.toUpperCase(),
    viscosityGrade: data.viscosityGrade,
    applicationSegment: data.applicationSegment,
    packaging: data.packaging,
    uom: data.uom,
    litersPerUnit: Number(data.litersPerUnit) || 1.0,
    minAlertStock: Number(data.minAlertStock) || 5,
    isDecantable: Boolean(data.isDecantable),
    isLoose: Boolean(data.isLoose),
    isActive: true,
  }

  saveStoredProduct(newProduct)
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, product: newProduct }
}

export async function updateMasterProduct(id: string, data: Partial<StoredProduct>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], data.agencyId)

  const prods = getStoredProducts()
  const existing = prods.find((p) => p.id === id)
  if (!existing) return { success: false, error: 'Product not found' }

  const updated = saveStoredProduct({ ...existing, ...data })
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, product: updated }
}

export async function deleteMasterProduct(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredProduct(id)
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 3. BATCH & FIFO COST CRUD (SUPER ADMIN, MANAGER, STOREKEEPER)
// -----------------------------------------------------------------------------

export async function getMasterBatches(agencyId?: string) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.STOREKEEPER], agencyId)
  return getStoredBatches(agencyId)
}

export async function createMasterBatch(data: {
  agencyId: string
  productId: string
  batchNumber: string
  supplierId?: string
  purchaseRate: number
  tradePrice: number
  mrp?: number
  stockQuantity: number
  minAlertStock?: number
  manufactureDate?: string
  expiryDate?: string
  receivedDate?: string
  poNumber?: string
  notes?: string
}) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.STOREKEEPER], data.agencyId)

  const id = `batch-${data.batchNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const receivedDate = data.receivedDate || new Date().toISOString().slice(0, 10)

  const newBatch: StoredBatch = {
    id,
    agencyId: data.agencyId,
    productId: data.productId,
    batchNumber: data.batchNumber.toUpperCase(),
    supplierId: data.supplierId,
    purchaseRate: Number(data.purchaseRate),
    tradePrice: Number(data.tradePrice),
    mrp: data.mrp ? Number(data.mrp) : Number(data.tradePrice) * 1.08,
    stockQuantity: Number(data.stockQuantity),
    initialQuantity: Number(data.stockQuantity),
    minAlertStock: data.minAlertStock ? Number(data.minAlertStock) : 5,
    manufactureDate: data.manufactureDate,
    expiryDate: data.expiryDate,
    receivedDate,
    isActive: true,
  }

  saveStoredBatch(newBatch)

  // Automatically record Inward Supplier Purchase Order so it affects BUY analytics & Supplier Khata
  if (Number(data.stockQuantity) > 0) {
    const products = getStoredProducts(data.agencyId)
    const prod = products.find((p) => p.id === data.productId)
    const agencies = getStoredAgencies()
    const agency = agencies.find((a) => a.id === data.agencyId)
    const suppliers = getStoredSuppliers(data.agencyId)
    const supplier = suppliers.find((s) => s.id === data.supplierId)

    const totalCost = Number(data.stockQuantity) * Number(data.purchaseRate)
    const unitLiters = prod?.litersPerUnit || 1
    const totalLiters = Number(data.stockQuantity) * unitLiters
    const orderDateIso = new Date(receivedDate).toISOString()

    const newPO: StoredPurchaseOrder = {
      id: `po-${Date.now()}`,
      agencyId: data.agencyId,
      agencyCode: agency?.code || data.agencyId,
      supplierId: supplier?.id || 'sup-direct',
      supplierName: supplier?.name || agency?.brandPrincipal || 'Principal Direct',
      poNumber: data.poNumber || `PO-${data.batchNumber.toUpperCase()}`,
      orderDate: orderDateIso,
      receivedDate: orderDateIso,
      totalAmount: totalCost,
      totalLiters,
      status: 'RECEIVED',
      notes: data.notes || `Inward batch purchase lot: ${data.batchNumber.toUpperCase()} (${data.stockQuantity} units)`,
      items: [
        {
          productId: data.productId,
          productName: prod?.name || 'Lubricant SKU',
          batchNumber: data.batchNumber.toUpperCase(),
          packaging: prod?.packaging || 'STANDARD',
          quantity: Number(data.stockQuantity),
          unitLiters,
          totalLiters,
          unitCost: Number(data.purchaseRate),
          totalCost,
        },
      ],
    }

    // Save purchase order (skipStockIncrement: true because batch was saved with initial stock)
    saveStoredPurchase(newPO, true)
  }

  revalidatePath('/inventory')
  revalidatePath('/analytics')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  revalidatePath('/khata')
  revalidatePath('/')
  return { success: true, batch: newBatch }
}

export async function updateMasterBatch(id: string, data: Partial<StoredBatch>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.STOREKEEPER], data.agencyId)

  const batches = getStoredBatches()
  const existing = batches.find((b) => b.id === id)
  if (!existing) return { success: false, error: 'Batch not found' }

  const updated = saveStoredBatch({ ...existing, ...data })
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, batch: updated }
}

export async function deleteMasterBatch(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredBatch(id)
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 4. CUSTOMER MASTER CRUD (SUPER ADMIN, MANAGER, CASHIER)
// -----------------------------------------------------------------------------

export async function getMasterCustomers() {
  return getStoredCustomers()
}

export async function createMasterCustomer(data: {
  name: string
  proprietor: string
  phone: string
  secondaryPhone?: string
  address: string
  district?: string
  vehicleTypeFocus?: string
  totalCreditLimit: number
  currentDue?: number
}) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.CASHIER])

  const id = `cust-${Date.now().toString().slice(-6)}`
  const newCustomer: StoredCustomer = {
    id,
    name: data.name,
    proprietor: data.proprietor,
    phone: data.phone,
    secondaryPhone: data.secondaryPhone,
    address: data.address,
    district: data.district || 'Dhaka',
    vehicleTypeFocus: data.vehicleTypeFocus || 'BUS_FLEET',
    totalCreditLimit: Number(data.totalCreditLimit) || 0,
    currentDue: Number(data.currentDue) || 0,
    isActive: true,
  }

  saveStoredCustomer(newCustomer)
  revalidatePath('/khata')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, customer: newCustomer }
}

export async function updateMasterCustomer(id: string, data: Partial<StoredCustomer>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.CASHIER])

  const existing = getStoredCustomers().find((c) => c.id === id)
  if (!existing) return { success: false, error: 'Customer not found' }

  const updated = saveStoredCustomer({ ...existing, ...data })
  revalidatePath('/khata')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, customer: updated }
}

export async function deleteMasterCustomer(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredCustomer(id)
  revalidatePath('/khata')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 5. INVOICES & CHALANS (SUPER ADMIN VOID/RESTORE CONTROL)
// -----------------------------------------------------------------------------

export async function getMasterInvoices(agencyId?: string) {
  return getStoredInvoices(agencyId)
}

export async function voidMasterInvoice(invoiceId: string, reason?: string) {
  await assertSuperAdmin()
  const success = voidStoredInvoice(invoiceId)
  if (!success) {
    return { success: false, error: 'Invoice not found or already voided.' }
  }

  revalidatePath('/pos')
  revalidatePath('/inventory')
  revalidatePath('/khata')
  revalidatePath('/')
  revalidatePath('/admin/master-data')
  return { success: true, message: 'Invoice voided and inventory reversed.' }
}

// -----------------------------------------------------------------------------
// 6. SUPPLIERS MASTER CRUD (SUPER ADMIN & MANAGER)
// -----------------------------------------------------------------------------

export async function getMasterSuppliers(agencyId?: string) {
  return getStoredSuppliers()
}

export async function createMasterSupplier(data: {
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  district?: string
  brandPrincipal?: string
  currentPayable?: number
  currentBalance?: number
  agencyId?: string
  code?: string
}) {
  await assertSuperAdmin()

  const id = `sup-${Date.now().toString().slice(-6)}`
  const newSupplier: StoredSupplier = {
    id,
    name: data.name,
    contactPerson: data.contactPerson,
    phone: data.phone,
    email: data.email,
    address: data.address,
    district: data.district || 'Dhaka',
    brandPrincipal: data.brandPrincipal || data.name,
    currentPayable: Number(data.currentPayable ?? data.currentBalance) || 0,
    isActive: true,
  }

  saveStoredSupplier(newSupplier)
  revalidatePath('/admin/master-data')
  return { success: true, supplier: newSupplier }
}

export async function updateMasterSupplier(id: string, data: Partial<StoredSupplier>) {
  await assertSuperAdmin()

  const existing = getStoredSuppliers().find((s) => s.id === id)
  if (!existing) return { success: false, error: 'Supplier not found' }

  const updated = saveStoredSupplier({ ...existing, ...data })
  revalidatePath('/admin/master-data')
  return { success: true, supplier: updated }
}

export async function deleteMasterSupplier(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredSupplier(id)
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 7. BRAND MASTER CRUD (SUPER ADMIN & AGENCY MANAGER)
// -----------------------------------------------------------------------------

export async function getMasterBrands() {
  return getStoredBrands()
}

export async function createMasterBrand(data: {
  name: string
  country?: string
  description?: string
}) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER])

  const name = data.name.trim()
  if (!name) return { success: false, error: 'Brand name is required' }

  // Check duplicate
  const existing = getStoredBrands().find(
    (b) => b.name.toLowerCase() === name.toLowerCase()
  )
  if (existing) {
    return { success: false, error: `Brand "${name}" already exists.` }
  }

  const id = `brand-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newBrand: StoredBrand = {
    id,
    name,
    country: data.country?.trim() || '',
    description: data.description?.trim() || '',
    isActive: true,
  }

  saveStoredBrand(newBrand)
  revalidatePath('/admin/master-data')
  return { success: true, brand: newBrand }
}

export async function updateMasterBrand(id: string, data: Partial<StoredBrand>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER])

  const existing = getStoredBrands().find((b) => b.id === id)
  if (!existing) return { success: false, error: 'Brand not found' }

  const updated = saveStoredBrand({ ...existing, ...data })
  revalidatePath('/admin/master-data')
  return { success: true, brand: updated }
}

export async function deleteMasterBrand(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredBrand(id)
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 8. VISCOSITY GRADE MASTER CRUD (SUPER ADMIN & AGENCY MANAGER)
// -----------------------------------------------------------------------------

export async function getMasterViscosityGrades() {
  return getStoredViscosityGrades()
}

export async function createMasterViscosityGrade(data: {
  code?: string
  name: string
  description?: string
}) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER])

  const name = data.name.trim()
  if (!name) return { success: false, error: 'Viscosity grade name is required' }

  const code = (data.code || name).trim().toUpperCase().replace(/[^A-Z0-9]/g, '_')

  // Check duplicate
  const existing = getStoredViscosityGrades().find(
    (v) => v.code === code || v.name.toLowerCase() === name.toLowerCase()
  )
  if (existing) {
    return { success: false, error: `Viscosity grade "${name}" (${code}) already exists.` }
  }

  const id = `visc-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newGrade: StoredViscosityGrade = {
    id,
    code,
    name,
    description: data.description?.trim() || '',
    isActive: true,
  }

  saveStoredViscosityGrade(newGrade)
  revalidatePath('/admin/master-data')
  return { success: true, viscosityGrade: newGrade }
}

export async function updateMasterViscosityGrade(id: string, data: Partial<StoredViscosityGrade>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER])

  const existing = getStoredViscosityGrades().find((v) => v.id === id)
  if (!existing) return { success: false, error: 'Viscosity grade not found' }

  const updated = saveStoredViscosityGrade({ ...existing, ...data })
  revalidatePath('/admin/master-data')
  return { success: true, viscosityGrade: updated }
}

export async function deleteMasterViscosityGrade(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredViscosityGrade(id)
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 9. PACKAGING TYPE MASTER CRUD (SUPER ADMIN & AGENCY MANAGER)
// -----------------------------------------------------------------------------

export async function getMasterPackagingTypes() {
  return getStoredPackagingTypes()
}

export async function createMasterPackagingType(data: {
  code?: string
  name: string
  defaultLiters: number
  uom?: string
  description?: string
}) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER])

  const name = data.name.trim()
  if (!name) return { success: false, error: 'Packaging type name is required' }

  const code = (data.code || name).trim().toUpperCase().replace(/[^A-Z0-9]/g, '_')

  // Check duplicate
  const existing = getStoredPackagingTypes().find(
    (p) => p.code === code || p.name.toLowerCase() === name.toLowerCase()
  )
  if (existing) {
    return { success: false, error: `Packaging type "${name}" (${code}) already exists.` }
  }

  const id = `pkg-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newPkg: StoredPackagingType = {
    id,
    code,
    name,
    defaultLiters: Number(data.defaultLiters) || 1.0,
    uom: data.uom === 'LITERS' ? 'LITERS' : 'PIECES',
    description: data.description?.trim() || '',
    isActive: true,
  }

  saveStoredPackagingType(newPkg)
  revalidatePath('/admin/master-data')
  return { success: true, packagingType: newPkg }
}

export async function updateMasterPackagingType(id: string, data: Partial<StoredPackagingType>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER])

  const existing = getStoredPackagingTypes().find((p) => p.id === id)
  if (!existing) return { success: false, error: 'Packaging type not found' }

  const updated = saveStoredPackagingType({ ...existing, ...data })
  revalidatePath('/admin/master-data')
  return { success: true, packagingType: updated }
}

export async function deleteMasterPackagingType(id: string) {
  await assertSuperAdmin()
  const success = deleteStoredPackagingType(id)
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// BACKEND PAGINATION SERVER ACTIONS
// -----------------------------------------------------------------------------

export async function getPaginatedMasterDataAction(params: {
  entity:
    | 'agencies'
    | 'products'
    | 'batches'
    | 'customers'
    | 'invoices'
    | 'suppliers'
    | 'brands'
    | 'viscosities'
    | 'packagingTypes'
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
  segment?: string
}) {
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10

  switch (params.entity) {
    case 'products':
      return {
        success: true,
        data: getPaginatedStoredProducts({
          agencyId: params.agencyId,
          page,
          pageSize,
          search: params.search,
          segment: params.segment,
        }),
      }
    case 'batches':
      return {
        success: true,
        data: getPaginatedStoredBatches({
          agencyId: params.agencyId,
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'agencies':
      return {
        success: true,
        data: getPaginatedStoredAgencies({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'brands':
      return {
        success: true,
        data: getPaginatedStoredBrands({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'viscosities':
      return {
        success: true,
        data: getPaginatedStoredViscosities({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'packagingTypes':
      return {
        success: true,
        data: getPaginatedStoredPackagingTypes({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'customers':
      return {
        success: true,
        data: getPaginatedStoredCustomers({
          agencyId: params.agencyId,
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'invoices':
      return {
        success: true,
        data: getPaginatedStoredInvoices({
          agencyId: params.agencyId,
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'suppliers':
      return {
        success: true,
        data: getPaginatedStoredSuppliers({
          agencyId: params.agencyId,
          page,
          pageSize,
          search: params.search,
        }),
      }
    default:
      return { success: false, error: 'Unknown entity' }
  }
}

export async function getPaginatedInventoryAction(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
  segment?: string
}) {
  return {
    success: true,
    data: getPaginatedStoredProducts({
      agencyId: params.agencyId,
      page: Number(params.page) || 1,
      pageSize: Number(params.pageSize) || 10,
      search: params.search,
      segment: params.segment,
    }),
  }
}

