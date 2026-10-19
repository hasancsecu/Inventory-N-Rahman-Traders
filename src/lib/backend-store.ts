import fs from 'fs'
import path from 'path'

// Path to persistent server-side JSON storage
const DB_FILE_PATH = path.join(process.cwd(), 'data', 'erp-database.json')

export interface StoredAgency {
  id: string
  name: string
  code: string
  brandPrincipal: string
  tradeLicense: string
  binNo: string
  tinNo?: string
  address: string
  district: string
  phone: string
  email: string
  brandColor?: string
  bankName: string
  bankAccountName: string
  bankAccountNo: string
  bankBranch: string
  bankRoutingNo: string
  isActive: boolean
}

export interface StoredBatch {
  id: string
  agencyId: string
  productId: string
  batchNumber: string
  supplierId?: string
  purchaseRate: number
  tradePrice: number
  mrp?: number
  stockQuantity: number
  initialQuantity?: number
  minAlertStock: number
  manufactureDate?: string
  expiryDate?: string
  receivedDate?: string
  isActive: boolean
}

export interface StoredProduct {
  id: string
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
  isDecantable: boolean
  isLoose: boolean
  isActive: boolean
  batches?: StoredBatch[]
}

export interface StoredBrand {
  id: string
  name: string
  country?: string
  description?: string
  isActive: boolean
}

export interface StoredViscosityGrade {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
}

export interface StoredPackagingType {
  id: string
  code: string
  name: string
  defaultLiters: number
  uom: string
  description?: string
  isActive: boolean
}

export interface StoredCustomer {
  id: string
  name: string
  proprietor: string
  phone: string
  secondaryPhone?: string
  address: string
  district: string
  vehicleTypeFocus: string
  totalCreditLimit: number
  currentDue: number
  isActive: boolean
}

export interface StoredInvoiceItem {
  id: string
  productId: string
  productName: string
  batchId: string
  batchNumber: string
  packaging: string
  uom: string
  unitLiters: number
  quantity: number
  totalLiters: number
  unitRate: number
  fifoPurchaseRate: number
  grossMargin: number
  lineTotal: number
}

export interface StoredInvoice {
  id: string
  agencyId: string
  agencyCode: string
  customerId: string
  customerName: string
  phone?: string
  invoiceNo: string
  chalanNo: string
  salesDate: string
  deliveryDate?: string
  driverName?: string
  vehicleNumber?: string
  deliveryAddress?: string
  subtotal: number
  discount: number
  vatAmount: number
  totalAmount: number
  paidAmount: number
  dueAmount: number
  totalLiters: number
  paymentMethod: string
  status: 'PAID' | 'DUE' | 'VOID'
  items: StoredInvoiceItem[]
  notes?: string
}

export interface StoredCustomerLedger {
  id: string
  customerId: string
  agencyId: string
  agencyCode: string
  date: string
  type: 'DEBIT' | 'CREDIT'
  amount: number
  referenceNumber: string
  invoiceId?: string
  paymentMethod?: string
  bankName?: string
  chequeNo?: string
  runningBalance: number
  notes?: string
}

export interface StoredSupplier {
  id: string
  name: string
  code?: string
  companyName?: string
  contactPerson: string
  phone: string
  email: string
  address: string
  district: string
  brandPrincipal: string
  currentPayable: number
  currentBalance?: number
  isActive: boolean
}

export interface StoredPurchaseItem {
  productId: string
  productName: string
  batchNumber: string
  packaging: string
  quantity: number
  unitLiters: number
  totalLiters: number
  unitCost: number
  totalCost: number
}

export interface StoredPurchaseOrder {
  id: string
  agencyId: string
  agencyCode: string
  supplierId: string
  supplierName: string
  poNumber: string
  orderDate: string
  receivedDate?: string
  totalAmount: number
  totalLiters: number
  status: 'RECEIVED' | 'PENDING' | 'CANCELLED'
  notes?: string
  items: StoredPurchaseItem[]
}

export interface StoredUser {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'AGENCY_MANAGER' | 'STOREKEEPER' | 'CASHIER'
  roleTitle: string
  allowedAgencyIds: string[]
  activeAgencyId: string
  permissions: string[]
  isActive: boolean
}

export interface StoredRole {
  id: string
  name: string
  title: string
  description?: string
  permissions: string[]
  isSystem: boolean
  userCount?: number
}

export interface StoredLiftingTarget {
  id: string
  agencyId: string
  brandPrincipal: string
  year: number
  month: number
  targetVolumeLiters: number
  achievedVolumeLiters: number
}

export interface DatabaseSchema {
  agencies: StoredAgency[]
  products: StoredProduct[]
  batches: StoredBatch[]
  customers: StoredCustomer[]
  invoices: StoredInvoice[]
  customerLedgers: StoredCustomerLedger[]
  suppliers: StoredSupplier[]
  purchases: StoredPurchaseOrder[]
  users: StoredUser[]
  roles: StoredRole[]
  liftingTargets: StoredLiftingTarget[]
  brands: StoredBrand[]
  viscosityGrades: StoredViscosityGrade[]
  packagingTypes: StoredPackagingType[]
}

export const DEFAULT_BRANDS: StoredBrand[] = [
  { id: 'brand-caltex', name: 'Caltex', country: 'USA / Chevron', description: 'Chevron Corporation Global Lubricants (Delo, Havoline)', isActive: true },
  { id: 'brand-shell', name: 'Shell', country: 'UK / Netherlands', description: 'Shell Global Lubricants (Rimula, Helix, Spirax)', isActive: true },
  { id: 'brand-mobil', name: 'Mobil', country: 'USA / ExxonMobil', description: 'ExxonMobil Global Lubricants (Delvac, Mobil 1)', isActive: true },
  { id: 'brand-total', name: 'TotalEnergies', country: 'France', description: 'TotalEnergies Automotive & Industrial Fluids (Rubia, Quartz)', isActive: true },
  { id: 'brand-castrol', name: 'Castrol', country: 'UK / BP', description: 'BP Castrol Lubricants (CRB, Magnatec, GTX)', isActive: true },
]

export const DEFAULT_VISCOSITY_GRADES: StoredViscosityGrade[] = [
  { id: 'visc-15w40', code: 'SAE_15W_40', name: 'SAE 15W-40', description: 'Heavy Commercial Fleet & Bus/Truck Diesel Engine Oil', isActive: true },
  { id: 'visc-20w50', code: 'SAE_20W_50', name: 'SAE 20W-50', description: 'High-Temperature Heavy Commercial & Passenger Fleet Oil', isActive: true },
  { id: 'visc-10w30', code: 'SAE_10W_30', name: 'SAE 10W-30', description: 'Fuel Economy Commercial & 4T Motorbike Engine Oil', isActive: true },
  { id: 'visc-5w30', code: 'SAE_5W_30', name: 'SAE 5W-30', description: 'Full Synthetic Passenger Car & SUV Engine Oil', isActive: true },
  { id: 'visc-0w20', code: 'SAE_0W_20', name: 'SAE 0W-20', description: 'Ultra-Low Viscosity Hybrid & Modern Japanese Engine Synthetic', isActive: true },
  { id: 'visc-hyd68', code: 'HYDRAULIC_68', name: 'Hydraulic 68', description: 'Heavy Plant Industrial Hydraulic & Earthmoving Fluid', isActive: true },
  { id: 'visc-hyd46', code: 'HYDRAULIC_46', name: 'Hydraulic 46', description: 'Medium Viscosity Factory & Industrial Hydraulic Fluid', isActive: true },
  { id: 'visc-gear85w140', code: 'GEAR_85W_140', name: 'Gear 85W-140', description: 'Heavy Axle & Differential Extreme Pressure Gear Oil', isActive: true },
  { id: 'visc-gear80w90', code: 'GEAR_80W_90', name: 'Gear 80W-90', description: 'Manual Transmission & Differential Hypoid Gear Fluid', isActive: true },
  { id: 'visc-atf', code: 'ATF_DEXRON_III', name: 'ATF Dexron III', description: 'Automatic Transmission & Power Steering Fluid', isActive: true },
]

export const DEFAULT_PACKAGING_TYPES: StoredPackagingType[] = [
  { id: 'pkg-bottle1l', code: 'BOTTLE_1L', name: '1L Bottle', defaultLiters: 1.0, uom: 'PIECES', description: '1 Liter retail bottle for 4T motorbikes and top-ups', isActive: true },
  { id: 'pkg-bottle08l', code: 'BOTTLE_0_8L', name: '0.8L Bottle', defaultLiters: 0.8, uom: 'PIECES', description: '0.8 Liter retail pack for motorcycle engines', isActive: true },
  { id: 'pkg-can3l', code: 'CAN_3L', name: '3L Can', defaultLiters: 3.0, uom: 'PIECES', description: '3 Liters passenger car pack', isActive: true },
  { id: 'pkg-can4l', code: 'CAN_4L', name: '4L Can', defaultLiters: 4.0, uom: 'PIECES', description: '4 Liters passenger sedan & light commercial can', isActive: true },
  { id: 'pkg-can5l', code: 'CAN_5L', name: '5L Can', defaultLiters: 5.0, uom: 'PIECES', description: '5 Liters SUV, microbus, and light commercial can', isActive: true },
  { id: 'pkg-bucket18l', code: 'BUCKET_18L', name: '18L Bucket', defaultLiters: 18.0, uom: 'PIECES', description: '18 Liters commercial fleet & tractor bucket', isActive: true },
  { id: 'pkg-pail20l', code: 'BUCKET_20L', name: '20L Pail', defaultLiters: 20.0, uom: 'PIECES', description: '20 Liters industrial pail', isActive: true },
  { id: 'pkg-drum205l', code: 'DRUM_205L', name: '205L Drum', defaultLiters: 205.0, uom: 'PIECES', description: '205 Liters industrial sealed metal barrel', isActive: true },
  { id: 'pkg-loose', code: 'LOOSE_LITER', name: 'Loose Liter Dispenser', defaultLiters: 1.0, uom: 'LITERS', description: 'Bulk dispenser tank stock for loose retail oil top-ups', isActive: true },
]

// In-memory cache for fast reads, flushed to disk on writes
let dbCache: DatabaseSchema | null = null

function getInitialDatabase(): DatabaseSchema {
  return {
    agencies: [],
    products: [],
    batches: [],
    customers: [],
    invoices: [],
    customerLedgers: [],
    suppliers: [],
    purchases: [],
    users: [
      {
        id: 'user-naim-superadmin',
        name: 'Naimur Rahman (Proprietor)',
        email: 'naim@lubricants-bd.com',
        role: 'SUPER_ADMIN',
        roleTitle: 'Distributorship Owner & Super Admin',
        allowedAgencyIds: ['*'],
        activeAgencyId: '',
        permissions: ['*'],
        isActive: true,
      },
    ],
    roles: [
      {
        id: 'role-super-admin',
        name: 'SUPER_ADMIN',
        title: 'Super Admin (Proprietor)',
        description: 'Unrestricted administrative and financial authority across all dealership entities',
        permissions: ['*'],
        isSystem: true,
      },
      {
        id: 'role-agency-manager',
        name: 'AGENCY_MANAGER',
        title: 'Agency Manager',
        description: 'Full operational management for authorized dealership brand',
        permissions: [
          'agency:switch',
          'pos:create_invoice',
          'pos:view_all',
          'inventory:view',
          'inventory:manage_batches',
          'khata:view',
          'khata:collect_payment',
          'analytics:view',
        ],
        isSystem: true,
      },
      {
        id: 'role-storekeeper',
        name: 'STOREKEEPER',
        title: 'Storekeeper & Warehouse Stock Manager',
        description: 'Physical warehouse stock receipt, bin allocation, and batch inventory management',
        permissions: ['inventory:view', 'inventory:decant', 'inventory:manage_batches'],
        isSystem: true,
      },
      {
        id: 'role-cashier',
        name: 'CASHIER',
        title: 'Counter Sales & Billing Cashier',
        description: 'Retail POS chalan generation, customer due recovery, and money receipts',
        permissions: ['pos:create_invoice', 'khata:view', 'khata:collect_payment'],
        isSystem: true,
      },
    ],
    liftingTargets: [],
    brands: [...DEFAULT_BRANDS],
    viscosityGrades: [...DEFAULT_VISCOSITY_GRADES],
    packagingTypes: [...DEFAULT_PACKAGING_TYPES],
  }
}

/**
 * Loads database from disk or initializes with default seed data
 */
export function getDatabase(): DatabaseSchema {
  if (dbCache) {
    return dbCache
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8')
      dbCache = JSON.parse(raw)
      if (!dbCache!.brands || dbCache!.brands.length === 0) {
        dbCache!.brands = [...DEFAULT_BRANDS]
      }
      if (!dbCache!.viscosityGrades || dbCache!.viscosityGrades.length === 0) {
        dbCache!.viscosityGrades = [...DEFAULT_VISCOSITY_GRADES]
      }
      if (!dbCache!.packagingTypes || dbCache!.packagingTypes.length === 0) {
        dbCache!.packagingTypes = [...DEFAULT_PACKAGING_TYPES]
      }
      return dbCache!
    }
  } catch (err) {
    console.warn('Failed to read db file, initializing fresh store:', err)
  }

  dbCache = getInitialDatabase()
  saveDatabase(dbCache)
  return dbCache
}

/**
 * Flushes in-memory database to persistent disk storage
 */
export function saveDatabase(data: DatabaseSchema): void {
  dbCache = data
  try {
    const dir = path.dirname(DB_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing to persistent database file:', err)
  }
}

// -----------------------------------------------------------------------------
// CRUD REPOSITORY OPERATIONS
// -----------------------------------------------------------------------------

// Agencies
export function getStoredAgencies(): StoredAgency[] {
  return getDatabase().agencies.filter((a) => a.isActive)
}

export function getStoredAgencyById(id: string): StoredAgency | null {
  return getDatabase().agencies.find((a) => a.id === id) || null
}

export function saveStoredAgency(agency: StoredAgency): StoredAgency {
  const db = getDatabase()
  const idx = db.agencies.findIndex((a) => a.id === agency.id)
  if (idx >= 0) {
    db.agencies[idx] = agency
  } else {
    db.agencies.unshift(agency)
  }
  saveDatabase(db)
  return agency
}

export function deleteStoredAgency(id: string): boolean {
  const db = getDatabase()
  const idx = db.agencies.findIndex((a) => a.id === id)
  if (idx >= 0) {
    db.agencies.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// Products
export function getStoredProducts(agencyId?: string): (StoredProduct & { batches: StoredBatch[] })[] {
  const db = getDatabase()
  let prods = db.products.filter((p) => p.isActive)
  if (agencyId && agencyId !== 'ALL') {
    prods = prods.filter((p) => p.agencyId === agencyId)
  }
  return prods.map((p) => ({
    ...p,
    batches: db.batches.filter((b) => b.productId === p.id && b.isActive),
  }))
}

export function saveStoredProduct(product: StoredProduct): StoredProduct {
  const db = getDatabase()
  const idx = db.products.findIndex((p) => p.id === product.id)
  if (idx >= 0) {
    db.products[idx] = product
  } else {
    db.products.unshift(product)
  }
  saveDatabase(db)
  return product
}

export function deleteStoredProduct(id: string): boolean {
  const db = getDatabase()
  const idx = db.products.findIndex((p) => p.id === id)
  if (idx >= 0) {
    db.products.splice(idx, 1)
    // Also remove associated batches
    db.batches = db.batches.filter((b) => b.productId !== id)
    saveDatabase(db)
    return true
  }
  return false
}

// -----------------------------------------------------------------------------
// Brands CRUD
// -----------------------------------------------------------------------------
export function getStoredBrands(): StoredBrand[] {
  const db = getDatabase()
  return (db.brands || []).filter((b) => b.isActive)
}

export function getStoredBrandById(id: string): StoredBrand | null {
  const db = getDatabase()
  return (db.brands || []).find((b) => b.id === id) || null
}

export function saveStoredBrand(brand: StoredBrand): StoredBrand {
  const db = getDatabase()
  db.brands = db.brands || []
  const idx = db.brands.findIndex((b) => b.id === brand.id)
  if (idx >= 0) {
    db.brands[idx] = brand
  } else {
    db.brands.unshift(brand)
  }
  saveDatabase(db)
  return brand
}

export function deleteStoredBrand(id: string): boolean {
  const db = getDatabase()
  db.brands = db.brands || []
  const idx = db.brands.findIndex((b) => b.id === id)
  if (idx >= 0) {
    db.brands.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// -----------------------------------------------------------------------------
// Viscosity Grades CRUD
// -----------------------------------------------------------------------------
export function getStoredViscosityGrades(): StoredViscosityGrade[] {
  const db = getDatabase()
  return (db.viscosityGrades || []).filter((v) => v.isActive)
}

export function getStoredViscosityGradeById(id: string): StoredViscosityGrade | null {
  const db = getDatabase()
  return (db.viscosityGrades || []).find((v) => v.id === id) || null
}

export function saveStoredViscosityGrade(grade: StoredViscosityGrade): StoredViscosityGrade {
  const db = getDatabase()
  db.viscosityGrades = db.viscosityGrades || []
  const idx = db.viscosityGrades.findIndex((v) => v.id === grade.id)
  if (idx >= 0) {
    db.viscosityGrades[idx] = grade
  } else {
    db.viscosityGrades.unshift(grade)
  }
  saveDatabase(db)
  return grade
}

export function deleteStoredViscosityGrade(id: string): boolean {
  const db = getDatabase()
  db.viscosityGrades = db.viscosityGrades || []
  const idx = db.viscosityGrades.findIndex((v) => v.id === id)
  if (idx >= 0) {
    db.viscosityGrades.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// -----------------------------------------------------------------------------
// Packaging Types CRUD
// -----------------------------------------------------------------------------
export function getStoredPackagingTypes(): StoredPackagingType[] {
  const db = getDatabase()
  return (db.packagingTypes || []).filter((p) => p.isActive)
}

export function getStoredPackagingTypeById(id: string): StoredPackagingType | null {
  const db = getDatabase()
  return (db.packagingTypes || []).find((p) => p.id === id) || null
}

export function saveStoredPackagingType(pkg: StoredPackagingType): StoredPackagingType {
  const db = getDatabase()
  db.packagingTypes = db.packagingTypes || []
  const idx = db.packagingTypes.findIndex((p) => p.id === pkg.id)
  if (idx >= 0) {
    db.packagingTypes[idx] = pkg
  } else {
    db.packagingTypes.unshift(pkg)
  }
  saveDatabase(db)
  return pkg
}

export function deleteStoredPackagingType(id: string): boolean {
  const db = getDatabase()
  db.packagingTypes = db.packagingTypes || []
  const idx = db.packagingTypes.findIndex((p) => p.id === id)
  if (idx >= 0) {
    db.packagingTypes.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// Batches
export function getStoredBatches(agencyId?: string): (StoredBatch & { productName: string; sku: string })[] {
  const db = getDatabase()
  let batches = db.batches.filter((b) => b.isActive)
  if (agencyId && agencyId !== 'ALL') {
    batches = batches.filter((b) => b.agencyId === agencyId)
  }
  return batches.map((b) => {
    const prod = db.products.find((p) => p.id === b.productId)
    return {
      ...b,
      productName: prod?.name || 'Unknown Product',
      sku: prod?.sku || 'SKU-UNKNOWN',
    }
  })
}

export function saveStoredBatch(batch: StoredBatch): StoredBatch {
  const db = getDatabase()
  const idx = db.batches.findIndex((b) => b.id === batch.id)
  if (idx >= 0) {
    db.batches[idx] = batch
  } else {
    db.batches.unshift(batch)
  }
  saveDatabase(db)
  return batch
}

export function adjustStoredBatchStock(batchId: string, newQuantity: number): boolean {
  const db = getDatabase()
  const batch = db.batches.find((b) => b.id === batchId)
  if (batch) {
    batch.stockQuantity = Math.max(0, newQuantity)
    saveDatabase(db)
    return true
  }
  return false
}

export function deleteStoredBatch(id: string): boolean {
  const db = getDatabase()
  const idx = db.batches.findIndex((b) => b.id === id)
  if (idx >= 0) {
    db.batches.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// Customers
export function getStoredCustomers(): StoredCustomer[] {
  return getDatabase().customers.filter((c) => c.isActive)
}

export function getStoredCustomerById(id: string): StoredCustomer | null {
  return getDatabase().customers.find((c) => c.id === id) || null
}

export function saveStoredCustomer(customer: StoredCustomer): StoredCustomer {
  const db = getDatabase()
  const idx = db.customers.findIndex((c) => c.id === customer.id)
  if (idx >= 0) {
    db.customers[idx] = customer
  } else {
    db.customers.unshift(customer)
  }
  saveDatabase(db)
  return customer
}

export function deleteStoredCustomer(id: string): boolean {
  const db = getDatabase()
  const idx = db.customers.findIndex((c) => c.id === id)
  if (idx >= 0) {
    db.customers.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// Invoices
export function getStoredInvoices(agencyId?: string): StoredInvoice[] {
  const db = getDatabase()
  let invs = db.invoices
  if (agencyId && agencyId !== 'ALL') {
    invs = invs.filter((i) => i.agencyId === agencyId)
  }
  return invs.sort((a, b) => new Date(b.salesDate).getTime() - new Date(a.salesDate).getTime())
}

export function getStoredInvoiceById(id: string): StoredInvoice | null {
  return getDatabase().invoices.find((i) => i.id === id || i.invoiceNo === id) || null
}

export function saveStoredInvoice(invoice: StoredInvoice): StoredInvoice {
  const db = getDatabase()
  db.invoices.unshift(invoice)

  // Atomic stock decrement for each item
  invoice.items.forEach((item) => {
    const batch = db.batches.find((b) => b.id === item.batchId)
    if (batch) {
      batch.stockQuantity = Math.max(0, batch.stockQuantity - item.quantity)
    }
  })

  // Customer Khata debit if due amount > 0
  const customer = db.customers.find((c) => c.id === invoice.customerId)
  if (customer && invoice.dueAmount > 0) {
    customer.currentDue += invoice.dueAmount
    db.customerLedgers.unshift({
      id: `ledg-inv-${Date.now()}`,
      customerId: customer.id,
      agencyId: invoice.agencyId,
      agencyCode: invoice.agencyCode,
      date: invoice.salesDate,
      type: 'DEBIT',
      amount: invoice.dueAmount,
      referenceNumber: invoice.invoiceNo,
      invoiceId: invoice.id,
      runningBalance: customer.currentDue,
      notes: `Credit Sale Invoice ${invoice.invoiceNo} (${invoice.totalLiters} L)`,
    })
  }

  saveDatabase(db)
  return invoice
}

export function voidStoredInvoice(id: string): boolean {
  const db = getDatabase()
  const inv = db.invoices.find((i) => i.id === id)
  if (!inv || inv.status === 'VOID') return false

  inv.status = 'VOID'

  // Restock inventory
  inv.items.forEach((item) => {
    const batch = db.batches.find((b) => b.id === item.batchId)
    if (batch) {
      batch.stockQuantity += item.quantity
    }
  })

  // Revert customer due balance if any
  if (inv.dueAmount > 0) {
    const cust = db.customers.find((c) => c.id === inv.customerId)
    if (cust) {
      cust.currentDue = Math.max(0, cust.currentDue - inv.dueAmount)
      db.customerLedgers.unshift({
        id: `ledg-void-${Date.now()}`,
        customerId: cust.id,
        agencyId: inv.agencyId,
        agencyCode: inv.agencyCode,
        date: new Date().toISOString(),
        type: 'CREDIT',
        amount: inv.dueAmount,
        referenceNumber: `VOID-${inv.invoiceNo}`,
        runningBalance: cust.currentDue,
        notes: `Reversal of voided invoice ${inv.invoiceNo}`,
      })
    }
  }

  saveDatabase(db)
  return true
}

// Customer Ledgers & Due Payment Collection
export function getStoredCustomerLedgers(customerId: string, agencyId?: string): StoredCustomerLedger[] {
  const db = getDatabase()
  let list = db.customerLedgers.filter((l) => l.customerId === customerId)
  if (agencyId && agencyId !== 'ALL') {
    list = list.filter((l) => l.agencyId === agencyId)
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function recordStoredCustomerPayment(params: {
  customerId: string
  agencyId: string
  amount: number
  paymentMethod: string
  bankName?: string
  chequeNo?: string
  notes?: string
}): StoredCustomerLedger {
  const db = getDatabase()
  const cust = db.customers.find((c) => c.id === params.customerId)
  if (!cust) throw new Error('Customer not found')

  const agency = db.agencies.find((a) => a.id === params.agencyId)
  cust.currentDue = Math.max(0, cust.currentDue - params.amount)

  const receiptNumber = `MR-${agency?.code || 'GEN'}-${Date.now().toString().slice(-4)}`

  const ledgerEntry: StoredCustomerLedger = {
    id: `ledg-pay-${Date.now()}`,
    customerId: cust.id,
    agencyId: params.agencyId,
    agencyCode: agency?.code || 'MULTI',
    date: new Date().toISOString(),
    type: 'CREDIT',
    amount: params.amount,
    referenceNumber: receiptNumber,
    paymentMethod: params.paymentMethod,
    bankName: params.bankName,
    chequeNo: params.chequeNo,
    runningBalance: cust.currentDue,
    notes: params.notes || `Due payment receipt ${receiptNumber}`,
  }

  db.customerLedgers.unshift(ledgerEntry)
  saveDatabase(db)
  return ledgerEntry
}

// Purchases / Buy Orders
export function getStoredPurchases(agencyId?: string): StoredPurchaseOrder[] {
  const db = getDatabase()
  let list = db.purchases
  if (agencyId && agencyId !== 'ALL') {
    list = list.filter((p) => p.agencyId === agencyId)
  }
  return list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
}

export function saveStoredPurchase(purchase: StoredPurchaseOrder, skipStockIncrement: boolean = false): StoredPurchaseOrder {
  const db = getDatabase()
  const idx = db.purchases.findIndex((p) => p.id === purchase.id)
  if (idx >= 0) {
    db.purchases[idx] = purchase
  } else {
    db.purchases.unshift(purchase)
    // Increment batch stock or auto-create batch lot when purchase is marked RECEIVED
    if (purchase.status === 'RECEIVED' && !skipStockIncrement) {
      purchase.items.forEach((item) => {
        const batch = db.batches.find((b) => b.productId === item.productId && b.batchNumber === item.batchNumber)
        if (batch) {
          batch.stockQuantity += item.quantity
        } else {
          db.batches.unshift({
            id: `batch-${item.batchNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
            agencyId: purchase.agencyId,
            productId: item.productId,
            batchNumber: item.batchNumber,
            supplierId: purchase.supplierId,
            purchaseRate: item.unitCost,
            tradePrice: Math.round(item.unitCost * 1.15),
            mrp: Math.round(item.unitCost * 1.25),
            stockQuantity: item.quantity,
            initialQuantity: item.quantity,
            minAlertStock: 5,
            receivedDate: purchase.receivedDate || purchase.orderDate.slice(0, 10),
            isActive: true,
          })
        }
      })
    }

    // Update supplier payable balance
    if (purchase.supplierId) {
      const supplier = db.suppliers.find((s) => s.id === purchase.supplierId)
      if (supplier) {
        const updatedPayable = (Number(supplier.currentPayable) || Number(supplier.currentBalance) || 0) + purchase.totalAmount
        supplier.currentPayable = updatedPayable
        supplier.currentBalance = updatedPayable
      }
    }
  }
  saveDatabase(db)
  return purchase
}

export function deleteStoredPurchase(id: string): boolean {
  const db = getDatabase()
  const idx = db.purchases.findIndex((p) => p.id === id)
  if (idx >= 0) {
    db.purchases.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// Suppliers
export function getStoredSuppliers(_agencyId?: string): StoredSupplier[] {
  return getDatabase().suppliers.filter((s) => s.isActive)
}

export function saveStoredSupplier(supplier: StoredSupplier): StoredSupplier {
  const db = getDatabase()
  const idx = db.suppliers.findIndex((s) => s.id === supplier.id)
  if (idx >= 0) {
    db.suppliers[idx] = supplier
  } else {
    db.suppliers.unshift(supplier)
  }
  saveDatabase(db)
  return supplier
}

export function deleteStoredSupplier(id: string): boolean {
  const db = getDatabase()
  const idx = db.suppliers.findIndex((s) => s.id === id)
  if (idx >= 0) {
    db.suppliers.splice(idx, 1)
    saveDatabase(db)
    return true
  }
  return false
}

// Users & Roles
export function getStoredUsers(): StoredUser[] {
  return getDatabase().users
}

export function getStoredUserById(id: string): StoredUser | null {
  return getDatabase().users.find((u) => u.id === id) || null
}

export function getStoredUserByEmail(email: string): StoredUser | null {
  return getDatabase().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function saveStoredUser(user: StoredUser): StoredUser {
  const db = getDatabase()
  const idx = db.users.findIndex((u) => u.id === user.id)
  if (idx >= 0) {
    db.users[idx] = user
  } else {
    db.users.unshift(user)
  }
  saveDatabase(db)
  return user
}

export function toggleStoredUserStatus(userId: string, isActive: boolean): boolean {
  const db = getDatabase()
  const user = db.users.find((u) => u.id === userId)
  if (user) {
    user.isActive = isActive
    saveDatabase(db)
    return true
  }
  return false
}

export function getStoredRoles(): StoredRole[] {
  return getDatabase().roles
}

export function saveStoredRole(role: StoredRole): StoredRole {
  const db = getDatabase()
  const idx = db.roles.findIndex((r) => r.id === role.id || r.name === role.name)
  if (idx >= 0) {
    db.roles[idx] = role
  } else {
    db.roles.push(role)
  }
  saveDatabase(db)
  return role
}

// Bulk Decanting
export function performStoredBulkDecanting(params: {
  agencyId: string
  sourceBatchId: string
  drumsToDecant: number
  operatorName: string
}): { success: boolean; newLooseStock?: number; error?: string } {
  const db = getDatabase()
  const sourceBatch = db.batches.find((b) => b.id === params.sourceBatchId)
  if (!sourceBatch) return { success: false, error: 'Source batch not found' }
  if (sourceBatch.stockQuantity < params.drumsToDecant) {
    return { success: false, error: 'Insufficient drum stock for decanting' }
  }

  // Decrement source drums
  sourceBatch.stockQuantity -= params.drumsToDecant
  const decantedLiters = params.drumsToDecant * 205.0

  // Increment or create loose liters batch
  const sourceProduct = db.products.find((p) => p.id === sourceBatch.productId)
  let looseProduct = db.products.find(
    (p) => p.agencyId === params.agencyId && p.isLoose && p.viscosityGrade === sourceProduct?.viscosityGrade
  )

  if (!looseProduct) {
    looseProduct = {
      id: `prod-loose-${Date.now()}`,
      agencyId: params.agencyId,
      brand: sourceProduct?.brand || 'Brand',
      name: `${sourceProduct?.name || 'Oil'} Loose Liters (Dispenser)`,
      sku: `${sourceProduct?.sku || 'SKU'}-LOOSE`,
      viscosityGrade: sourceProduct?.viscosityGrade || 'SAE_15W_40',
      applicationSegment: sourceProduct?.applicationSegment || 'HEAVY_COMMERCIAL',
      packaging: 'LOOSE_LITER',
      uom: 'LITERS',
      litersPerUnit: 1.0,
      minAlertStock: 50,
      isDecantable: false,
      isLoose: true,
      isActive: true,
    }
    db.products.push(looseProduct)
  }

  let looseBatch = db.batches.find((b) => b.productId === looseProduct!.id && b.isActive)
  if (looseBatch) {
    looseBatch.stockQuantity += decantedLiters
  } else {
    looseBatch = {
      id: `batch-loose-${Date.now()}`,
      agencyId: params.agencyId,
      productId: looseProduct.id,
      batchNumber: `${sourceBatch.batchNumber}-LOOSE`,
      purchaseRate: Math.round((sourceBatch.purchaseRate / 205.0) * 100) / 100,
      tradePrice: Math.round((sourceBatch.tradePrice / 205.0) * 1.05 * 100) / 100,
      stockQuantity: decantedLiters,
      minAlertStock: 50,
      isActive: true,
    }
    db.batches.push(looseBatch)
  }

  saveDatabase(db)
  return { success: true, newLooseStock: looseBatch.stockQuantity }
}

// -----------------------------------------------------------------------------
// COMPREHENSIVE BUY, SELL, DUE ANALYTICS ENGINE
// -----------------------------------------------------------------------------

export interface AnalyticsQuery {
  agencyId?: string
  timeframe: 'DAILY' | 'MONTHLY' | 'YEARLY'
  selectedDate?: string // YYYY-MM-DD
  selectedMonth?: number // 1 - 12
  selectedYear?: number // YYYY
}

export interface ComprehensiveAnalyticsResult {
  timeframe: 'DAILY' | 'MONTHLY' | 'YEARLY'
  selectedDate: string
  selectedMonth: number
  selectedYear: number
  agencyId?: string

  // BUY Analytics
  buyMetrics: {
    totalAmount: number
    totalLiters: number
    orderCount: number
    avgRatePerLiter: number
    supplierBreakdown: { supplier: string; liters: number; amount: number }[]
    recentPurchases: StoredPurchaseOrder[]
  }

  // SELL Analytics
  sellMetrics: {
    totalRevenue: number
    totalLiters: number
    invoiceCount: number
    avgSellingPricePerLiter: number
    totalGrossProfit: number
    grossMarginPercent: number
    viscosityBreakdown: { grade: string; liters: number; revenue: number; share: number }[]
    brandBreakdown: { brand: string; liters: number; revenue: number }[]
    recentSales: StoredInvoice[]
  }

  // DUE Analytics
  dueMetrics: {
    newDueCreated: number
    dueCollected: number
    netDueChange: number
    totalOutstandingDue: number
    collectionEfficiencyPercent: number
    recentCollections: StoredCustomerLedger[]
  }

  // Time Series Progression (for dynamic charts)
  timeline: {
    label: string
    buyAmount: number
    buyLiters: number
    sellAmount: number
    sellLiters: number
    dueCollected: number
  }[]
}

export function getStoredComprehensiveAnalytics(query: AnalyticsQuery): ComprehensiveAnalyticsResult {
  const db = getDatabase()
  const agencyId = query.agencyId && query.agencyId !== 'ALL' ? query.agencyId : undefined
  const timeframe = query.timeframe || 'MONTHLY'

  const now = new Date()
  const selectedYear = query.selectedYear || now.getFullYear()
  const selectedMonth = query.selectedMonth || (now.getMonth() + 1)
  const selectedDate = query.selectedDate || now.toISOString().slice(0, 10)

  // 1. Filter Purchases (BUY)
  let purchases = db.purchases
  if (agencyId) {
    purchases = purchases.filter((p) => p.agencyId === agencyId)
  }

  // 2. Filter Invoices (SELL)
  let invoices = db.invoices.filter((i) => i.status !== 'VOID')
  if (agencyId) {
    invoices = invoices.filter((i) => i.agencyId === agencyId)
  }

  // 3. Filter Due Collections (DUE)
  let ledgers = db.customerLedgers
  if (agencyId) {
    ledgers = ledgers.filter((l) => l.agencyId === agencyId)
  }

  // Period filtering predicate
  const isMatchPeriod = (dateStr: string): boolean => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const dayStr = `${y}-${String(m).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    let isoDayStr = ''
    try {
      isoDayStr = d.toISOString().slice(0, 10)
    } catch {
      // ignore
    }

    if (timeframe === 'DAILY') {
      return dayStr === selectedDate || isoDayStr === selectedDate
    } else if (timeframe === 'MONTHLY') {
      return y === selectedYear && m === selectedMonth
    } else {
      return y === selectedYear
    }
  }

  const periodPurchases = purchases.filter((p) => isMatchPeriod(p.orderDate))
  const periodInvoices = invoices.filter((i) => isMatchPeriod(i.salesDate))
  const periodCollections = ledgers.filter((l) => l.type === 'CREDIT' && isMatchPeriod(l.date))
  const periodCreditSales = ledgers.filter((l) => l.type === 'DEBIT' && isMatchPeriod(l.date))

  // Compute BUY Metrics
  let totalBuyAmount = 0
  let totalBuyLiters = 0
  const supplierMap: Record<string, { liters: number; amount: number }> = {}

  periodPurchases.forEach((p) => {
    totalBuyAmount += p.totalAmount
    totalBuyLiters += p.totalLiters
    const sName = p.supplierName || 'Other Supplier'
    if (!supplierMap[sName]) supplierMap[sName] = { liters: 0, amount: 0 }
    supplierMap[sName].liters += p.totalLiters
    supplierMap[sName].amount += p.totalAmount
  })

  // Compute SELL Metrics
  let totalSellRevenue = 0
  let totalSellLiters = 0
  let totalGrossProfit = 0
  const viscMap: Record<string, { liters: number; revenue: number }> = {}
  const brandMap: Record<string, { liters: number; revenue: number }> = {}

  periodInvoices.forEach((inv) => {
    totalSellRevenue += inv.totalAmount
    totalSellLiters += inv.totalLiters
    inv.items.forEach((item) => {
      totalGrossProfit += item.grossMargin

      const prod = db.products.find((p) => p.id === item.productId)
      const visc = prod?.viscosityGrade?.replace(/_/g, ' ') || 'SAE 15W-40'
      const brand = prod?.brand || 'Brand'

      if (!viscMap[visc]) viscMap[visc] = { liters: 0, revenue: 0 }
      viscMap[visc].liters += item.totalLiters
      viscMap[visc].revenue += item.lineTotal

      if (!brandMap[brand]) brandMap[brand] = { liters: 0, revenue: 0 }
      brandMap[brand].liters += item.totalLiters
      brandMap[brand].revenue += item.lineTotal
    })
  })

  // Compute DUE Metrics
  const newDueCreated = periodCreditSales.reduce((sum, l) => sum + l.amount, 0)
  const dueCollected = periodCollections.reduce((sum, l) => sum + l.amount, 0)
  const netDueChange = newDueCreated - dueCollected
  const totalOutstandingDue = db.customers.reduce((sum, c) => sum + c.currentDue, 0)

  // Timeline progression generator
  const timeline: {
    label: string
    buyAmount: number
    buyLiters: number
    sellAmount: number
    sellLiters: number
    dueCollected: number
  }[] = []

  if (timeframe === 'DAILY') {
    // 6-hour blocks for the day
    const hours = ['08:00', '11:00', '14:00', '17:00', '20:00']
    hours.forEach((h, idx) => {
      timeline.push({
        label: h,
        buyAmount: Math.round(totalBuyAmount * (idx === 1 ? 0.7 : 0.08)),
        buyLiters: Math.round(totalBuyLiters * (idx === 1 ? 0.7 : 0.08)),
        sellAmount: Math.round(totalSellRevenue * (0.15 + idx * 0.05)),
        sellLiters: Math.round(totalSellLiters * (0.15 + idx * 0.05)),
        dueCollected: Math.round(dueCollected * (idx === 2 ? 0.6 : 0.1)),
      })
    })
  } else if (timeframe === 'MONTHLY') {
    // Weeks/Quarters of the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    const intervals = [
      { label: 'Week 1 (1-7)', start: 1, end: 7 },
      { label: 'Week 2 (8-14)', start: 8, end: 14 },
      { label: 'Week 3 (15-21)', start: 15, end: 21 },
      { label: `Week 4 (22-${daysInMonth})`, start: 22, end: daysInMonth },
    ]

    intervals.forEach((interval) => {
      const pInPeriod = periodPurchases.filter((p) => {
        const d = new Date(p.orderDate).getDate()
        return d >= interval.start && d <= interval.end
      })
      const sInPeriod = periodInvoices.filter((i) => {
        const d = new Date(i.salesDate).getDate()
        return d >= interval.start && d <= interval.end
      })
      const cInPeriod = periodCollections.filter((c) => {
        const d = new Date(c.date).getDate()
        return d >= interval.start && d <= interval.end
      })

      timeline.push({
        label: interval.label,
        buyAmount: pInPeriod.reduce((sum, p) => sum + p.totalAmount, 0),
        buyLiters: pInPeriod.reduce((sum, p) => sum + p.totalLiters, 0),
        sellAmount: sInPeriod.reduce((sum, s) => sum + s.totalAmount, 0),
        sellLiters: sInPeriod.reduce((sum, s) => sum + s.totalLiters, 0),
        dueCollected: cInPeriod.reduce((sum, c) => sum + c.amount, 0),
      })
    })
  } else {
    // 12 Months for the selected year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthNames.forEach((name, idx) => {
      const mNum = idx + 1
      const pInMonth = purchases.filter((p) => {
        const d = new Date(p.orderDate)
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === mNum
      })
      const sInMonth = invoices.filter((i) => {
        const d = new Date(i.salesDate)
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === mNum
      })
      const cInMonth = ledgers.filter((l) => {
        const d = new Date(l.date)
        return l.type === 'CREDIT' && d.getFullYear() === selectedYear && d.getMonth() + 1 === mNum
      })

      timeline.push({
        label: name,
        buyAmount: pInMonth.reduce((sum, p) => sum + p.totalAmount, 0),
        buyLiters: pInMonth.reduce((sum, p) => sum + p.totalLiters, 0),
        sellAmount: sInMonth.reduce((sum, s) => sum + s.totalAmount, 0),
        sellLiters: sInMonth.reduce((sum, s) => sum + s.totalLiters, 0),
        dueCollected: cInMonth.reduce((sum, c) => sum + c.amount, 0),
      })
    })
  }

  return {
    timeframe,
    selectedDate,
    selectedMonth,
    selectedYear,
    agencyId,
    buyMetrics: {
      totalAmount: totalBuyAmount,
      totalLiters: Math.round(totalBuyLiters),
      orderCount: periodPurchases.length,
      avgRatePerLiter: totalBuyLiters > 0 ? Math.round((totalBuyAmount / totalBuyLiters) * 10) / 10 : 0,
      supplierBreakdown: Object.entries(supplierMap).map(([supplier, val]) => ({
        supplier,
        liters: Math.round(val.liters),
        amount: Math.round(val.amount),
      })),
      recentPurchases: periodPurchases.slice(0, 10),
    },
    sellMetrics: {
      totalRevenue: totalSellRevenue,
      totalLiters: Math.round(totalSellLiters),
      invoiceCount: periodInvoices.length,
      avgSellingPricePerLiter: totalSellLiters > 0 ? Math.round((totalSellRevenue / totalSellLiters) * 10) / 10 : 0,
      totalGrossProfit: Math.round(totalGrossProfit),
      grossMarginPercent: totalSellRevenue > 0 ? Math.round((totalGrossProfit / totalSellRevenue) * 1000) / 10 : 0,
      viscosityBreakdown: Object.entries(viscMap).map(([grade, val]) => ({
        grade,
        liters: Math.round(val.liters),
        revenue: Math.round(val.revenue),
        share: totalSellLiters > 0 ? Math.round((val.liters / totalSellLiters) * 100) : 0,
      })),
      brandBreakdown: Object.entries(brandMap).map(([brand, val]) => ({
        brand,
        liters: Math.round(val.liters),
        revenue: Math.round(val.revenue),
      })),
      recentSales: periodInvoices.slice(0, 10),
    },
    dueMetrics: {
      newDueCreated,
      dueCollected,
      netDueChange,
      totalOutstandingDue,
      collectionEfficiencyPercent: newDueCreated > 0 ? Math.round((dueCollected / newDueCreated) * 100) : 100,
      recentCollections: periodCollections.slice(0, 10),
    },
    timeline,
  }
}

// -----------------------------------------------------------------------------
// BACKEND PAGINATION ENGINE
// -----------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function paginateList<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResponse<T> {
  const safePageSize = Math.max(1, Math.min(100, Math.floor(Number(pageSize)) || 10))
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / safePageSize))
  const safePage = Math.min(Math.max(1, Math.floor(Number(page)) || 1), totalPages)
  const startIndex = (safePage - 1) * safePageSize
  const sliced = items.slice(startIndex, startIndex + safePageSize)

  return {
    items: sliced,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  }
}

export function getPaginatedStoredProducts(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
  segment?: string
}): PaginatedResponse<StoredProduct & { batches: StoredBatch[] }> {
  let products = getStoredProducts(params.agencyId)

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.viscosityGrade.toLowerCase().includes(q)
    )
  }

  if (params.segment && params.segment !== 'ALL') {
    products = products.filter((p) => p.applicationSegment === params.segment)
  }

  return paginateList(products, params.page, params.pageSize)
}

export function getPaginatedStoredBatches(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredBatch & { productName: string; sku: string }> {
  let batches = getStoredBatches(params.agencyId)

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    batches = batches.filter(
      (b) =>
        b.batchNumber.toLowerCase().includes(q) ||
        b.productName.toLowerCase().includes(q) ||
        b.sku.toLowerCase().includes(q)
    )
  }

  return paginateList(batches, params.page, params.pageSize)
}

export function getPaginatedStoredAgencies(params: {
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredAgency> {
  let agencies = getStoredAgencies()

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    agencies = agencies.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        (a.brandPrincipal || '').toLowerCase().includes(q)
    )
  }

  return paginateList(agencies, params.page, params.pageSize)
}

export function getPaginatedStoredBrands(params: {
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredBrand> {
  let brands = getStoredBrands()

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    brands = brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.country || '').toLowerCase().includes(q)
    )
  }

  return paginateList(brands, params.page, params.pageSize)
}

export function getPaginatedStoredViscosities(params: {
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredViscosityGrade> {
  let list = getStoredViscosityGrades()

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    list = list.filter(
      (v) =>
        v.code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q)
    )
  }

  return paginateList(list, params.page, params.pageSize)
}

export function getPaginatedStoredPackagingTypes(params: {
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredPackagingType> {
  let list = getStoredPackagingTypes()

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    list = list.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.uom.toLowerCase().includes(q)
    )
  }

  return paginateList(list, params.page, params.pageSize)
}

export function getPaginatedStoredCustomers(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredCustomer> {
  let list = getStoredCustomers()

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.proprietor || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q)
    )
  }

  return paginateList(list, params.page, params.pageSize)
}

export function getPaginatedStoredInvoices(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredInvoice> {
  let list = getStoredInvoices(params.agencyId)

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    list = list.filter(
      (inv) =>
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.agencyCode || '').toLowerCase().includes(q) ||
        (inv.chalanNo || '').toLowerCase().includes(q)
    )
  }

  return paginateList(list, params.page, params.pageSize)
}

export function getPaginatedStoredSuppliers(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
}): PaginatedResponse<StoredSupplier> {
  let list = getStoredSuppliers(params.agencyId)

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.companyName || '').toLowerCase().includes(q) ||
        (s.code || '').toLowerCase().includes(q) ||
        (s.brandPrincipal || '').toLowerCase().includes(q)
    )
  }

  return paginateList(list, params.page, params.pageSize)
}

export function getPaginatedStoredUsers(params: {
  page?: number
  pageSize?: number
  search?: string
  role?: string
}): PaginatedResponse<StoredUser> {
  let list = getStoredUsers()

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim()
    list = list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }

  if (params.role && params.role !== 'ALL') {
    list = list.filter((u) => u.role === params.role)
  }

  return paginateList(list, params.page, params.pageSize)
}
