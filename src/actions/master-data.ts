'use server'

import { getCurrentUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import {
  getDbAgencies,
  getDbAgencyById,
  saveDbAgency,
  deleteDbAgency,
  getDbProducts,
  getDbProductById,
  saveDbProduct,
  deleteDbProduct,
  getDbBatches,
  getDbBatchById,
  saveDbBatch,
  deleteDbBatch,
  getDbCustomers,
  getDbCustomerById,
  saveDbCustomer,
  deleteDbCustomer,
  getDbInvoices,
  getDbInvoiceById,
  voidDbInvoice,
  getDbSuppliers,
  getDbSupplierById,
  saveDbSupplier,
  deleteDbSupplier,
  getDbBrands,
  saveDbBrand,
  deleteDbBrand,
  getDbViscosityGrades,
  saveDbViscosityGrade,
  deleteDbViscosityGrade,
  getDbPackagingTypes,
  saveDbPackagingType,
  deleteDbPackagingType,
  getDbPurchases,
  saveDbPurchase,
  deleteDbPurchase,
  getPaginatedDbProducts,
  getPaginatedDbBatches,
  getPaginatedDbAgencies,
  getPaginatedDbBrands,
  getPaginatedDbViscosities,
  getPaginatedDbPackagingTypes,
  getPaginatedDbCustomers,
  getPaginatedDbInvoices,
  getPaginatedDbSuppliers,
  getDbMasterStats,
} from '@/lib/db-service'
import {
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
  if (!currentUser || (currentUser.role !== UserRole.SUPER_ADMIN && !currentUser.allowedAgencyIds.includes('*'))) {
    throw new Error(
      'Access Denied: Super Admin clearance is required to execute global master data operations.'
    )
  }
  return currentUser
}

async function assertAuthorized(allowedRoles: UserRole[], agencyId?: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error('Access Denied: You must be logged in to perform this action.')
  }
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
  return getDbMasterStats()
}

// -----------------------------------------------------------------------------
// 1. AGENCY MASTER CRUD (SUPER ADMIN EXCLUSIVE)
// -----------------------------------------------------------------------------

export async function getMasterAgencies(): Promise<StoredAgency[]> {
  await assertSuperAdmin()
  return getDbAgencies()
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
    email: data.email || '',
    address: data.address,
    district: data.district || '',
    brandColor: data.brandColor || '#dc2626',
    bankName: data.bankName || '',
    bankAccountName: data.bankAccountName || data.name,
    bankAccountNo: data.bankAccountNo || '',
    bankBranch: data.bankBranch || '',
    bankRoutingNo: data.bankRoutingNo || '',
    isActive: true,
  }

  const saved = await saveDbAgency(newAgency)
  revalidatePath('/', 'layout')
  return { success: true, agency: saved }
}

export async function updateMasterAgency(id: string, data: Partial<StoredAgency>) {
  await assertSuperAdmin()

  const agency = await getDbAgencyById(id)
  if (!agency) return { success: false, error: 'Agency not found' }

  const updated = await saveDbAgency({ ...agency, ...data })
  revalidatePath('/', 'layout')
  return { success: true, agency: updated }
}

export async function deleteMasterAgency(id: string) {
  await assertSuperAdmin()
  const success = await deleteDbAgency(id)
  revalidatePath('/', 'layout')
  return { success }
}

// -----------------------------------------------------------------------------
// 2. PRODUCT MASTER CRUD (SUPER ADMIN & AGENCY MANAGER)
// -----------------------------------------------------------------------------

export async function getMasterProducts(agencyId?: string) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], agencyId)
  return getDbProducts(agencyId)
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

  const saved = await saveDbProduct(newProduct)
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, product: saved }
}

export async function updateMasterProduct(id: string, data: Partial<StoredProduct>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], data.agencyId)

  const existing = await getDbProductById(id)
  if (!existing) return { success: false, error: 'Product not found' }

  const updated = await saveDbProduct({ ...existing, ...data })
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, product: updated }
}

export async function deleteMasterProduct(id: string) {
  const existing = await getDbProductById(id)
  if (existing) {
    await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], existing.agencyId)
  }
  const success = await deleteDbProduct(id)
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 3. INVENTORY BATCH CRUD (SUPER ADMIN & STOREKEEPER)
// -----------------------------------------------------------------------------

export async function getMasterBatches(agencyId?: string) {
  return getDbBatches(agencyId)
}

export async function createMasterBatch(data: {
  agencyId: string
  productId: string
  batchNumber: string
  supplierId?: string
  purchaseRate: number
  tradePrice: number
  mrp: number
  stockQuantity: number
  minAlertStock?: number
  expiryDate?: string
  receivedDate?: string
  poNumber?: string
  notes?: string
}) {
  await assertAuthorized(
    [UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.STOREKEEPER],
    data.agencyId
  )

  const id = `batch-${data.batchNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newBatch: StoredBatch = {
    id,
    agencyId: data.agencyId,
    productId: data.productId,
    batchNumber: data.batchNumber.toUpperCase(),
    supplierId: data.supplierId,
    purchaseRate: Number(data.purchaseRate) || 0,
    tradePrice: Number(data.tradePrice) || 0,
    mrp: Number(data.mrp) || 0,
    stockQuantity: Number(data.stockQuantity) || 0,
    initialQuantity: Number(data.stockQuantity) || 0,
    minAlertStock: Number(data.minAlertStock) || 5,
    expiryDate: data.expiryDate,
    receivedDate: data.receivedDate || new Date().toISOString().slice(0, 10),
    isActive: true,
  }

  const saved = await saveDbBatch(newBatch)
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, batch: saved }
}

export async function updateMasterBatch(id: string, data: Partial<StoredBatch>) {
  await assertAuthorized(
    [UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.STOREKEEPER],
    data.agencyId
  )

  const existing = await getDbBatchById(id)
  if (!existing) return { success: false, error: 'Batch not found' }

  const updated = await saveDbBatch({ ...existing, ...data })
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, batch: updated }
}

export async function deleteMasterBatch(id: string) {
  const existing = await getDbBatchById(id)
  if (existing) {
    await assertAuthorized(
      [UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER, UserRole.STOREKEEPER],
      existing.agencyId
    )
  }
  const success = await deleteDbBatch(id)
  revalidatePath('/inventory')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 4. CUSTOMER PROFILE CRUD (SUPER ADMIN & CASHIER)
// -----------------------------------------------------------------------------

export async function getMasterCustomers() {
  return getDbCustomers()
}

export async function createMasterCustomer(data: {
  name: string
  proprietor?: string
  phone: string
  secondaryPhone?: string
  address: string
  district?: string
  vehicleTypeFocus?: any
  totalCreditLimit: number
}) {
  await assertAuthorized([
    UserRole.SUPER_ADMIN,
    UserRole.AGENCY_MANAGER,
    UserRole.CASHIER,
  ])

  const id = `cust-${data.phone.replace(/[^0-9]/g, '').slice(-6)}-${Date.now().toString().slice(-4)}`
  const newCustomer: StoredCustomer = {
    id,
    name: data.name,
    proprietor: data.proprietor || '',
    phone: data.phone,
    secondaryPhone: data.secondaryPhone,
    address: data.address,
    district: data.district || 'Dhaka',
    vehicleTypeFocus: data.vehicleTypeFocus || 'BUS_FLEET',
    totalCreditLimit: Number(data.totalCreditLimit) || 0,
    currentDue: 0,
    isActive: true,
  }

  const saved = await saveDbCustomer(newCustomer)
  revalidatePath('/khata')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, customer: saved }
}

export async function updateMasterCustomer(id: string, data: Partial<StoredCustomer>) {
  await assertAuthorized([
    UserRole.SUPER_ADMIN,
    UserRole.AGENCY_MANAGER,
    UserRole.CASHIER,
  ])

  const existing = await getDbCustomerById(id)
  if (!existing) return { success: false, error: 'Customer not found' }

  const updated = await saveDbCustomer({ ...existing, ...data })
  revalidatePath('/khata')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success: true, customer: updated }
}

export async function deleteMasterCustomer(id: string) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER])
  const success = await deleteDbCustomer(id)
  revalidatePath('/khata')
  revalidatePath('/pos')
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 5. SUPPLIER MASTER CRUD (SUPER ADMIN & STOREKEEPER)
// -----------------------------------------------------------------------------

export async function getMasterSuppliers(agencyId?: string) {
  return getDbSuppliers(agencyId)
}

export async function createMasterSupplier(data: {
  agencyId: string
  name: string
  code: string
  contactPerson?: string
  phone: string
  email?: string
  address: string
  currentPayable?: number
}) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], data.agencyId)

  const id = `supp-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newSupplier: StoredSupplier = {
    id,
    agencyId: data.agencyId,
    name: data.name,
    code: data.code.toUpperCase(),
    contactPerson: data.contactPerson || '',
    phone: data.phone,
    email: data.email || '',
    address: data.address,
    district: 'Dhaka',
    brandPrincipal: 'Principal Supplier',
    currentPayable: Number(data.currentPayable) || 0,
    currentBalance: Number(data.currentPayable) || 0,
    isActive: true,
  }

  const saved = await saveDbSupplier(newSupplier)
  revalidatePath('/inventory')
  revalidatePath('/admin/master-data')
  return { success: true, supplier: saved }
}

export async function updateMasterSupplier(id: string, data: Partial<StoredSupplier>) {
  await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], data.agencyId)

  const existing = await getDbSupplierById(id)
  if (!existing) return { success: false, error: 'Supplier not found' }

  const updated = await saveDbSupplier({ ...existing, ...data })
  revalidatePath('/inventory')
  revalidatePath('/admin/master-data')
  return { success: true, supplier: updated }
}

export async function deleteMasterSupplier(id: string) {
  const existing = await getDbSupplierById(id)
  if (existing) {
    await assertAuthorized([UserRole.SUPER_ADMIN, UserRole.AGENCY_MANAGER], existing.agencyId)
  }
  const success = await deleteDbSupplier(id)
  revalidatePath('/inventory')
  revalidatePath('/admin/master-data')
  return { success }
}

// -----------------------------------------------------------------------------
// 6. BRAND MASTER CRUD
// -----------------------------------------------------------------------------

export async function getMasterBrands() {
  return getDbBrands()
}

export async function createMasterBrand(data: {
  name: string
  country?: string
  description?: string
}) {
  await assertSuperAdmin()
  const id = `brand-${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newBrand: StoredBrand = {
    id,
    name: data.name,
    country: data.country,
    description: data.description,
    isActive: true,
  }
  const saved = await saveDbBrand(newBrand)
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success: true, brand: saved }
}

export async function updateMasterBrand(id: string, data: Partial<StoredBrand>) {
  await assertSuperAdmin()
  const brands = await getDbBrands()
  const brand = brands.find((b) => b.id === id)
  if (!brand) return { success: false, error: 'Brand not found' }
  const updated = await saveDbBrand({ ...brand, ...data })
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success: true, brand: updated }
}

export async function deleteMasterBrand(id: string) {
  await assertSuperAdmin()
  const success = await deleteDbBrand(id)
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success }
}

// -----------------------------------------------------------------------------
// 7. VISCOSITY GRADE CRUD
// -----------------------------------------------------------------------------

export async function getMasterViscosities() {
  return getDbViscosityGrades()
}

export const getMasterViscosityGrades = getMasterViscosities

export async function createMasterViscosity(data: {
  code: string
  name: string
  description?: string
}) {
  await assertSuperAdmin()
  const id = `visc-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newVisc: StoredViscosityGrade = {
    id,
    code: data.code.toUpperCase(),
    name: data.name,
    description: data.description,
    isActive: true,
  }
  const saved = await saveDbViscosityGrade(newVisc)
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success: true, viscosity: saved }
}

export async function updateMasterViscosity(id: string, data: Partial<StoredViscosityGrade>) {
  await assertSuperAdmin()
  const list = await getDbViscosityGrades()
  const item = list.find((v) => v.id === id)
  if (!item) return { success: false, error: 'Viscosity Grade not found' }
  const updated = await saveDbViscosityGrade({ ...item, ...data })
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success: true, viscosity: updated }
}

export async function deleteMasterViscosity(id: string) {
  await assertSuperAdmin()
  const success = await deleteDbViscosityGrade(id)
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success }
}

export const createMasterViscosityGrade = createMasterViscosity
export const updateMasterViscosityGrade = updateMasterViscosity
export const deleteMasterViscosityGrade = deleteMasterViscosity

// -----------------------------------------------------------------------------
// 8. PACKAGING TYPE CRUD
// -----------------------------------------------------------------------------

export async function getMasterPackagingTypes() {
  return getDbPackagingTypes()
}

export async function createMasterPackagingType(data: {
  code: string
  name: string
  defaultLiters: number
  uom: string
  description?: string
}) {
  await assertSuperAdmin()
  const id = `pkg-${data.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`
  const newPkg: StoredPackagingType = {
    id,
    code: data.code.toUpperCase(),
    name: data.name,
    defaultLiters: Number(data.defaultLiters) || 1.0,
    uom: data.uom,
    description: data.description,
    isActive: true,
  }
  const saved = await saveDbPackagingType(newPkg)
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success: true, packaging: saved, packagingType: saved }
}

export async function updateMasterPackagingType(id: string, data: Partial<StoredPackagingType>) {
  await assertSuperAdmin()
  const list = await getDbPackagingTypes()
  const item = list.find((p) => p.id === id)
  if (!item) return { success: false, error: 'Packaging Type not found' }
  const updated = await saveDbPackagingType({ ...item, ...data })
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success: true, packaging: updated, packagingType: updated }
}

export async function deleteMasterPackagingType(id: string) {
  await assertSuperAdmin()
  const success = await deleteDbPackagingType(id)
  revalidatePath('/admin/master-data')
  revalidatePath('/inventory')
  return { success }
}

// -----------------------------------------------------------------------------
// 9. INVOICES
// -----------------------------------------------------------------------------

export async function getMasterInvoices(agencyId?: string) {
  return getDbInvoices(agencyId)
}

export async function voidMasterInvoice(id: string) {
  await assertSuperAdmin()
  const success = await voidDbInvoice(id)
  revalidatePath('/admin/master-data')
  revalidatePath('/khata')
  revalidatePath('/pos')
  return { success }
}

// -----------------------------------------------------------------------------
// 10. PAGINATED MASTER DATA QUERIES
// -----------------------------------------------------------------------------

export async function getPaginatedMasterData(
  type: string,
  params: {
    agencyId?: string
    page?: number
    pageSize?: number
    search?: string
    segment?: string
  }
) {
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10

  switch (type) {
    case 'products':
      return {
        success: true,
        data: await getPaginatedDbProducts({
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
        data: await getPaginatedDbBatches({
          agencyId: params.agencyId,
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'agencies':
      return {
        success: true,
        data: await getPaginatedDbAgencies({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'brands':
      return {
        success: true,
        data: await getPaginatedDbBrands({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'viscosities':
      return {
        success: true,
        data: await getPaginatedDbViscosities({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'packagingTypes':
      return {
        success: true,
        data: await getPaginatedDbPackagingTypes({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'customers':
      return {
        success: true,
        data: await getPaginatedDbCustomers({
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'invoices':
      return {
        success: true,
        data: await getPaginatedDbInvoices({
          agencyId: params.agencyId,
          page,
          pageSize,
          search: params.search,
        }),
      }
    case 'suppliers':
      return {
        success: true,
        data: await getPaginatedDbSuppliers({
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
    data: await getPaginatedDbProducts({
      agencyId: params.agencyId,
      page: Number(params.page) || 1,
      pageSize: Number(params.pageSize) || 10,
      search: params.search,
      segment: params.segment,
    }),
  }
}
