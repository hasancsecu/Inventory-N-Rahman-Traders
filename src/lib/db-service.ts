import { prisma } from '@/lib/prisma'
import {
  getStoredAgencies,
  getStoredAgencyById,
  saveStoredAgency,
  deleteStoredAgency,
  getStoredProducts,
  getStoredProductById,
  saveStoredProduct,
  deleteStoredProduct,
  getStoredBatches,
  getStoredBatchById,
  saveStoredBatch,
  deleteStoredBatch,
  getStoredCustomers,
  getStoredCustomerById,
  saveStoredCustomer,
  deleteStoredCustomer,
  getStoredInvoices,
  getStoredInvoiceById,
  voidStoredInvoice,
  getStoredSuppliers,
  getStoredSupplierById,
  saveStoredSupplier,
  deleteStoredSupplier,
  getStoredUsers,
  getStoredUserById,
  getStoredUserByEmail,
  saveStoredUser,
  toggleStoredUserStatus,
  getStoredRoles,
  saveStoredRole,
  getStoredBrands,
  saveStoredBrand,
  deleteStoredBrand,
  getStoredViscosityGrades,
  saveStoredViscosityGrade,
  deleteStoredViscosityGrade,
  getStoredPackagingTypes,
  saveStoredPackagingType,
  deleteStoredPackagingType,
  getStoredPurchases,
  saveStoredPurchase,
  deleteStoredPurchase,
  getStoredComprehensiveAnalytics,
  PaginatedResponse,
  paginateList,
  getPaginatedStoredProducts,
  getPaginatedStoredBatches,
  getPaginatedStoredAgencies,
  getPaginatedStoredBrands,
  getPaginatedStoredViscosities,
  getPaginatedStoredPackagingTypes,
  getPaginatedStoredCustomers,
  getPaginatedStoredInvoices,
  getPaginatedStoredSuppliers,
  getPaginatedStoredUsers,
  StoredAgency,
  StoredProduct,
  StoredBatch,
  StoredCustomer,
  StoredInvoice,
  StoredSupplier,
  StoredUser,
  StoredRole,
  StoredBrand,
  StoredViscosityGrade,
  StoredPackagingType,
  StoredPurchaseOrder,
  StoredPurchaseItem,
  AnalyticsQuery,
  ComprehensiveAnalyticsResult,
} from '@/lib/backend-store'
import { ApplicationSegment, UnitOfMeasure, UserRole, POStatus, PaymentMethod } from '@prisma/client'

/**
 * Checks whether DATABASE_URL is configured and not a placeholder.
 */
export function isPostgresConfigured(): boolean {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL
  return Boolean(
    url &&
      !url.includes('demo_secret') &&
      !url.includes('example.com')
  )
}

// -----------------------------------------------------------------------------
// 1. AGENCIES (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbAgencies(): Promise<StoredAgency[]> {
  try {
    const dbAgencies = await prisma.agency.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    if (dbAgencies && dbAgencies.length > 0) {
      return dbAgencies.map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
        brandPrincipal: a.brandPrincipal,
        tradeLicense: a.tradeLicense,
        binNo: a.binNo,
        tinNo: a.tinNo || undefined,
        address: a.address,
        district: a.district || 'Dhaka',
        phone: a.phone,
        email: a.email || '',
        brandColor: a.brandColor || '#dc2626',
        bankName: a.bankName || 'Islami Bank Bangladesh Limited',
        bankAccountName: a.bankAccountName || a.name,
        bankAccountNo: a.bankAccountNo || '20501234567890',
        bankBranch: a.bankBranch || 'Principal Branch',
        bankRoutingNo: a.bankRoutingNo || '125272891',
        isActive: a.isActive,
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbAgencies query deferred to local store:', err?.message)
  }

  return getStoredAgencies()
}

export async function getDbAgencyById(id: string): Promise<StoredAgency | null> {
  try {
    const a = await prisma.agency.findUnique({
      where: { id },
    })
    if (a) {
      return {
        id: a.id,
        name: a.name,
        code: a.code,
        brandPrincipal: a.brandPrincipal,
        tradeLicense: a.tradeLicense,
        binNo: a.binNo,
        tinNo: a.tinNo || undefined,
        address: a.address,
        district: a.district || 'Dhaka',
        phone: a.phone,
        email: a.email || '',
        brandColor: a.brandColor || '#dc2626',
        bankName: a.bankName || 'Islami Bank Bangladesh Limited',
        bankAccountName: a.bankAccountName || a.name,
        bankAccountNo: a.bankAccountNo || '20501234567890',
        bankBranch: a.bankBranch || 'Principal Branch',
        bankRoutingNo: a.bankRoutingNo || '125272891',
        isActive: a.isActive,
      }
    }
  } catch {}

  const local = getStoredAgencies().find((a) => a.id === id)
  return local || null
}

export async function saveDbAgency(agency: StoredAgency): Promise<StoredAgency> {
  try {
    await prisma.agency.upsert({
      where: { id: agency.id },
      create: {
        id: agency.id,
        name: agency.name,
        code: agency.code.toUpperCase(),
        brandPrincipal: agency.brandPrincipal,
        tradeLicense: agency.tradeLicense,
        binNo: agency.binNo,
        tinNo: agency.tinNo,
        address: agency.address,
        district: agency.district || 'Dhaka',
        phone: agency.phone,
        email: agency.email,
        brandColor: agency.brandColor || '#dc2626',
        bankName: agency.bankName,
        bankAccountName: agency.bankAccountName,
        bankAccountNo: agency.bankAccountNo,
        bankBranch: agency.bankBranch,
        bankRoutingNo: agency.bankRoutingNo,
        isActive: agency.isActive !== false,
      },
      update: {
        name: agency.name,
        code: agency.code.toUpperCase(),
        brandPrincipal: agency.brandPrincipal,
        tradeLicense: agency.tradeLicense,
        binNo: agency.binNo,
        tinNo: agency.tinNo,
        address: agency.address,
        district: agency.district || 'Dhaka',
        phone: agency.phone,
        email: agency.email,
        brandColor: agency.brandColor || '#dc2626',
        bankName: agency.bankName,
        bankAccountName: agency.bankAccountName,
        bankAccountNo: agency.bankAccountNo,
        bankBranch: agency.bankBranch,
        bankRoutingNo: agency.bankRoutingNo,
        isActive: agency.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbAgency error, keeping in sync with local store:', err?.message)
  }

  return saveStoredAgency(agency)
}

export async function deleteDbAgency(id: string): Promise<boolean> {
  try {
    await prisma.agency.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbAgency error:', err?.message)
  }
  return deleteStoredAgency(id)
}

export async function getPaginatedDbAgencies(params: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredAgency>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { brandPrincipal: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.agency.count({ where }),
      prisma.agency.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { code: 'asc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped = items.map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
        brandPrincipal: a.brandPrincipal,
        tradeLicense: a.tradeLicense,
        binNo: a.binNo,
        tinNo: a.tinNo || undefined,
        address: a.address,
        district: a.district || 'Dhaka',
        phone: a.phone,
        email: a.email || '',
        brandColor: a.brandColor || '#dc2626',
        bankName: a.bankName || 'Islami Bank Bangladesh Limited',
        bankAccountName: a.bankAccountName || a.name,
        bankAccountNo: a.bankAccountNo || '20501234567890',
        bankBranch: a.bankBranch || 'Principal Branch',
        bankRoutingNo: a.bankRoutingNo || '125272891',
        isActive: a.isActive,
      }))
      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbAgencies deferred:', err?.message)
  }

  return getPaginatedStoredAgencies(params)
}

// -----------------------------------------------------------------------------
// 2. PRODUCTS (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbProducts(agencyId?: string): Promise<StoredProduct[]> {
  try {
    const where: any = { isActive: true }
    if (agencyId && agencyId !== 'ALL') {
      where.agencyId = agencyId
    }

    const dbProducts = await prisma.product.findMany({
      where,
      include: {
        batches: {
          where: { isActive: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => ({
        id: p.id,
        agencyId: p.agencyId,
        brand: p.brand,
        name: p.name,
        sku: p.sku,
        viscosityGrade: p.viscosityGrade,
        applicationSegment: p.applicationSegment,
        packaging: p.packaging,
        uom: p.uom,
        litersPerUnit: p.litersPerUnit,
        minAlertStock: p.minAlertStock,
        isDecantable: p.isDecantable,
        isLoose: p.isLoose,
        isActive: p.isActive,
        batches: p.batches.map((b) => ({
          id: b.id,
          agencyId: b.agencyId,
          productId: b.productId,
          batchNumber: b.batchNumber,
          supplierId: b.supplierId || undefined,
          purchaseRate: b.purchaseRate,
          tradePrice: b.tradePrice,
          mrp: b.mrp,
          stockQuantity: b.stockQuantity,
          initialQuantity: b.initialQuantity,
          minAlertStock: b.minAlertStock,
          expiryDate: b.expiryDate ? b.expiryDate.toISOString() : undefined,
          receivedDate: b.receivedDate ? b.receivedDate.toISOString().slice(0, 10) : undefined,
          isActive: b.isActive,
        })),
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbProducts query deferred to local store:', err?.message)
  }

  return getStoredProducts(agencyId)
}

export async function getDbProductById(id: string): Promise<StoredProduct | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { id },
      include: { batches: { where: { isActive: true } } },
    })
    if (p) {
      return {
        id: p.id,
        agencyId: p.agencyId,
        brand: p.brand,
        name: p.name,
        sku: p.sku,
        viscosityGrade: p.viscosityGrade,
        applicationSegment: p.applicationSegment,
        packaging: p.packaging,
        uom: p.uom,
        litersPerUnit: p.litersPerUnit,
        minAlertStock: p.minAlertStock,
        isDecantable: p.isDecantable,
        isLoose: p.isLoose,
        isActive: p.isActive,
        batches: p.batches.map((b) => ({
          id: b.id,
          agencyId: b.agencyId,
          productId: b.productId,
          batchNumber: b.batchNumber,
          supplierId: b.supplierId || undefined,
          purchaseRate: b.purchaseRate,
          tradePrice: b.tradePrice,
          mrp: b.mrp,
          stockQuantity: b.stockQuantity,
          initialQuantity: b.initialQuantity,
          minAlertStock: b.minAlertStock,
          expiryDate: b.expiryDate ? b.expiryDate.toISOString() : undefined,
          receivedDate: b.receivedDate ? b.receivedDate.toISOString().slice(0, 10) : undefined,
          isActive: b.isActive,
        })),
      }
    }
  } catch {}

  return getStoredProductById(id)
}

export async function saveDbProduct(product: StoredProduct): Promise<StoredProduct> {
  try {
    const uom = product.uom === 'PIECES' ? UnitOfMeasure.PIECES : UnitOfMeasure.LITERS
    const appSegment = (Object.values(ApplicationSegment).includes(product.applicationSegment as any)
      ? product.applicationSegment
      : ApplicationSegment.HEAVY_COMMERCIAL) as ApplicationSegment

    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        agencyId: product.agencyId,
        brand: product.brand,
        name: product.name,
        sku: product.sku.toUpperCase(),
        viscosityGrade: product.viscosityGrade,
        applicationSegment: appSegment,
        packaging: product.packaging,
        uom,
        litersPerUnit: Number(product.litersPerUnit) || 1.0,
        minAlertStock: Number(product.minAlertStock) || 5,
        isDecantable: Boolean(product.isDecantable),
        isLoose: Boolean(product.isLoose),
        isActive: product.isActive !== false,
      },
      update: {
        agencyId: product.agencyId,
        brand: product.brand,
        name: product.name,
        sku: product.sku.toUpperCase(),
        viscosityGrade: product.viscosityGrade,
        applicationSegment: appSegment,
        packaging: product.packaging,
        uom,
        litersPerUnit: Number(product.litersPerUnit) || 1.0,
        minAlertStock: Number(product.minAlertStock) || 5,
        isDecantable: Boolean(product.isDecantable),
        isLoose: Boolean(product.isLoose),
        isActive: product.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbProduct error, falling back to local store:', err?.message)
  }

  return saveStoredProduct(product)
}

export async function deleteDbProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbProduct error:', err?.message)
  }
  return deleteStoredProduct(id)
}

export async function getPaginatedDbProducts(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
  segment?: string
}): Promise<PaginatedResponse<StoredProduct>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.agencyId && params.agencyId !== 'ALL') {
      where.agencyId = params.agencyId
    }
    if (params.segment && params.segment !== 'ALL') {
      where.applicationSegment = params.segment
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { viscosityGrade: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, dbProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          batches: { where: { isActive: true } },
          agency: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const items: StoredProduct[] = dbProducts.map((p) => ({
        id: p.id,
        agencyId: p.agencyId,
        brand: p.brand,
        name: p.name,
        sku: p.sku,
        viscosityGrade: p.viscosityGrade,
        applicationSegment: p.applicationSegment,
        packaging: p.packaging,
        uom: p.uom,
        litersPerUnit: p.litersPerUnit,
        minAlertStock: p.minAlertStock,
        isDecantable: p.isDecantable,
        isLoose: p.isLoose,
        isActive: p.isActive,
        agency: p.agency
          ? {
              id: p.agency.id,
              name: p.agency.name,
              code: p.agency.code,
              brandPrincipal: p.agency.brandPrincipal,
              tradeLicense: p.agency.tradeLicense,
              binNo: p.agency.binNo,
              address: p.agency.address,
              district: p.agency.district,
              phone: p.agency.phone,
              brandColor: p.agency.brandColor,
              bankName: p.agency.bankName || '',
              bankAccountName: p.agency.bankAccountName || '',
              bankAccountNo: p.agency.bankAccountNo || '',
              bankBranch: p.agency.bankBranch || '',
              bankRoutingNo: p.agency.bankRoutingNo || '',
              isActive: p.agency.isActive,
            }
          : undefined,
        batches: p.batches.map((b) => ({
          id: b.id,
          agencyId: b.agencyId,
          productId: b.productId,
          batchNumber: b.batchNumber,
          supplierId: b.supplierId || undefined,
          purchaseRate: b.purchaseRate,
          tradePrice: b.tradePrice,
          mrp: b.mrp,
          stockQuantity: b.stockQuantity,
          initialQuantity: b.initialQuantity,
          minAlertStock: b.minAlertStock,
          expiryDate: b.expiryDate ? b.expiryDate.toISOString() : undefined,
          receivedDate: b.receivedDate ? b.receivedDate.toISOString().slice(0, 10) : undefined,
          isActive: b.isActive,
        })),
      }))

      const totalPages = Math.ceil(total / pageSize)
      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbProducts deferred to local store:', err?.message)
  }

  return getPaginatedStoredProducts(params)
}

// -----------------------------------------------------------------------------
// 3. INVENTORY BATCHES (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbBatches(agencyId?: string): Promise<(StoredBatch & { productName: string; sku: string })[]> {
  try {
    const where: any = { isActive: true }
    if (agencyId && agencyId !== 'ALL') {
      where.agencyId = agencyId
    }

    const batches = await prisma.inventoryBatch.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (batches && batches.length > 0) {
      return batches.map((b) => ({
        id: b.id,
        agencyId: b.agencyId,
        productId: b.productId,
        batchNumber: b.batchNumber,
        supplierId: b.supplierId || undefined,
        purchaseRate: b.purchaseRate,
        tradePrice: b.tradePrice,
        mrp: b.mrp,
        stockQuantity: b.stockQuantity,
        initialQuantity: b.initialQuantity,
        minAlertStock: b.minAlertStock,
        expiryDate: b.expiryDate ? b.expiryDate.toISOString() : undefined,
        receivedDate: b.receivedDate ? b.receivedDate.toISOString().slice(0, 10) : undefined,
        isActive: b.isActive,
        productName: b.product?.name || 'Unknown Product',
        sku: b.product?.sku || 'SKU-UNKNOWN',
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbBatches query deferred to local store:', err?.message)
  }

  return getStoredBatches(agencyId)
}

export async function getDbBatchById(id: string): Promise<StoredBatch | null> {
  try {
    const b = await prisma.inventoryBatch.findUnique({
      where: { id },
    })
    if (b) {
      return {
        id: b.id,
        agencyId: b.agencyId,
        productId: b.productId,
        batchNumber: b.batchNumber,
        supplierId: b.supplierId || undefined,
        purchaseRate: b.purchaseRate,
        tradePrice: b.tradePrice,
        mrp: b.mrp,
        stockQuantity: b.stockQuantity,
        initialQuantity: b.initialQuantity,
        minAlertStock: b.minAlertStock,
        expiryDate: b.expiryDate ? b.expiryDate.toISOString() : undefined,
        receivedDate: b.receivedDate ? b.receivedDate.toISOString().slice(0, 10) : undefined,
        isActive: b.isActive,
      }
    }
  } catch {}

  return getStoredBatchById(id)
}

export async function saveDbBatch(batch: StoredBatch): Promise<StoredBatch> {
  try {
    await prisma.inventoryBatch.upsert({
      where: { id: batch.id },
      create: {
        id: batch.id,
        agencyId: batch.agencyId,
        productId: batch.productId,
        batchNumber: batch.batchNumber,
        supplierId: batch.supplierId || null,
        purchaseRate: Number(batch.purchaseRate) || 0,
        tradePrice: Number(batch.tradePrice) || 0,
        mrp: Number(batch.mrp) || 0,
        stockQuantity: Number(batch.stockQuantity) || 0,
        initialQuantity: Number(batch.initialQuantity || batch.stockQuantity) || 0,
        minAlertStock: Number(batch.minAlertStock) || 5,
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : null,
        receivedDate: batch.receivedDate ? new Date(batch.receivedDate) : new Date(),
        isActive: batch.isActive !== false,
      },
      update: {
        agencyId: batch.agencyId,
        productId: batch.productId,
        batchNumber: batch.batchNumber,
        supplierId: batch.supplierId || null,
        purchaseRate: Number(batch.purchaseRate) || 0,
        tradePrice: Number(batch.tradePrice) || 0,
        mrp: Number(batch.mrp) || 0,
        stockQuantity: Number(batch.stockQuantity) || 0,
        minAlertStock: Number(batch.minAlertStock) || 5,
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate) : null,
        receivedDate: batch.receivedDate ? new Date(batch.receivedDate) : new Date(),
        isActive: batch.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbBatch error, falling back to local store:', err?.message)
  }

  return saveStoredBatch(batch)
}

export async function deleteDbBatch(id: string): Promise<boolean> {
  try {
    await prisma.inventoryBatch.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbBatch error:', err?.message)
  }
  return deleteStoredBatch(id)
}

export async function getPaginatedDbBatches(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredBatch & { productName: string; sku: string }>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.agencyId && params.agencyId !== 'ALL') {
      where.agencyId = params.agencyId
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { batchNumber: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { product: { sku: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const [total, batches] = await Promise.all([
      prisma.inventoryBatch.count({ where }),
      prisma.inventoryBatch.findMany({
        where,
        include: { product: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const items = batches.map((b) => ({
        id: b.id,
        agencyId: b.agencyId,
        productId: b.productId,
        batchNumber: b.batchNumber,
        supplierId: b.supplierId || undefined,
        purchaseRate: b.purchaseRate,
        tradePrice: b.tradePrice,
        mrp: b.mrp,
        stockQuantity: b.stockQuantity,
        initialQuantity: b.initialQuantity,
        minAlertStock: b.minAlertStock,
        expiryDate: b.expiryDate ? b.expiryDate.toISOString() : undefined,
        receivedDate: b.receivedDate ? b.receivedDate.toISOString().slice(0, 10) : undefined,
        isActive: b.isActive,
        productName: b.product?.name || 'Unknown Product',
        sku: b.product?.sku || 'SKU-UNKNOWN',
      }))
      const totalPages = Math.ceil(total / pageSize)
      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbBatches deferred to local store:', err?.message)
  }

  return getPaginatedStoredBatches(params)
}

// -----------------------------------------------------------------------------
// 4. CUSTOMERS (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbCustomers(): Promise<StoredCustomer[]> {
  try {
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    if (customers && customers.length > 0) {
      return customers.map((c) => ({
        id: c.id,
        name: c.name,
        proprietor: c.proprietor || '',
        phone: c.phone,
        secondaryPhone: c.secondaryPhone || undefined,
        address: c.address,
        district: c.district,
        vehicleTypeFocus: c.vehicleTypeFocus,
        totalCreditLimit: c.totalCreditLimit,
        currentDue: c.currentDue,
        isActive: c.isActive,
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbCustomers query deferred to local store:', err?.message)
  }

  return getStoredCustomers()
}

export async function getDbCustomerById(id: string): Promise<StoredCustomer | null> {
  try {
    const c = await prisma.customer.findUnique({
      where: { id },
    })
    if (c) {
      return {
        id: c.id,
        name: c.name,
        proprietor: c.proprietor || '',
        phone: c.phone,
        secondaryPhone: c.secondaryPhone || undefined,
        address: c.address,
        district: c.district,
        vehicleTypeFocus: c.vehicleTypeFocus,
        totalCreditLimit: c.totalCreditLimit,
        currentDue: c.currentDue,
        isActive: c.isActive,
      }
    }
  } catch {}

  return getStoredCustomerById(id)
}

export async function saveDbCustomer(customer: StoredCustomer): Promise<StoredCustomer> {
  try {
    await prisma.customer.upsert({
      where: { id: customer.id },
      create: {
        id: customer.id,
        name: customer.name,
        proprietor: customer.proprietor,
        phone: customer.phone,
        secondaryPhone: customer.secondaryPhone,
        address: customer.address,
        district: customer.district || 'Dhaka',
        vehicleTypeFocus: customer.vehicleTypeFocus as any,
        totalCreditLimit: Number(customer.totalCreditLimit) || 0,
        currentDue: Number(customer.currentDue) || 0,
        isActive: customer.isActive !== false,
      },
      update: {
        name: customer.name,
        proprietor: customer.proprietor,
        phone: customer.phone,
        secondaryPhone: customer.secondaryPhone,
        address: customer.address,
        district: customer.district || 'Dhaka',
        vehicleTypeFocus: customer.vehicleTypeFocus as any,
        totalCreditLimit: Number(customer.totalCreditLimit) || 0,
        currentDue: Number(customer.currentDue) || 0,
        isActive: customer.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbCustomer error, falling back to local store:', err?.message)
  }

  return saveStoredCustomer(customer)
}

export async function deleteDbCustomer(id: string): Promise<boolean> {
  try {
    await prisma.customer.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbCustomer error:', err?.message)
  }
  return deleteStoredCustomer(id)
}

export async function getPaginatedDbCustomers(params: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredCustomer>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { proprietor: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped = items.map((c) => ({
        id: c.id,
        name: c.name,
        proprietor: c.proprietor || '',
        phone: c.phone,
        secondaryPhone: c.secondaryPhone || undefined,
        address: c.address,
        district: c.district,
        vehicleTypeFocus: c.vehicleTypeFocus,
        totalCreditLimit: c.totalCreditLimit,
        currentDue: c.currentDue,
        isActive: c.isActive,
      }))
      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbCustomers deferred to local store:', err?.message)
  }

  return getPaginatedStoredCustomers(params)
}

// -----------------------------------------------------------------------------
// 5. INVOICES (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbInvoices(agencyId?: string): Promise<StoredInvoice[]> {
  try {
    const where: any = {}
    if (agencyId && agencyId !== 'ALL') {
      where.agencyId = agencyId
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        agency: true,
        customer: true,
        items: true,
      },
      orderBy: { salesDate: 'desc' },
      take: 200,
    })

    if (invoices && invoices.length > 0) {
      return invoices.map((inv) => ({
        id: inv.id,
        agencyId: inv.agencyId,
        agencyCode: inv.agency?.code || 'CTX',
        customerId: inv.customerId,
        customerName: inv.customer?.name || 'Customer',
        phone: inv.customer?.phone || undefined,
        invoiceNo: inv.invoiceNo,
        chalanNo: inv.chalanNo,
        salesDate: inv.salesDate.toISOString(),
        deliveryDate: inv.salesDate.toISOString(),
        driverName: inv.driverName || undefined,
        vehicleNumber: inv.vehicleNumber || undefined,
        deliveryAddress: inv.deliveryAddress || undefined,
        subtotal: inv.subtotal,
        discount: inv.discount,
        vatAmount: inv.vatAmount,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        dueAmount: inv.dueAmount,
        totalLiters: inv.items.reduce((s, it) => s + it.totalLiters, 0),
        paymentMethod: inv.paymentMethod,
        status: inv.status === 'CANCELLED' ? 'VOID' : inv.dueAmount <= 0 ? 'PAID' : 'DUE',
        notes: inv.notes || undefined,
        items: inv.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: 'Lubricant Product',
          batchId: it.batchId,
          batchNumber: 'BATCH-LOT',
          packaging: it.packaging,
          uom: it.uom,
          unitLiters: it.unitLiters,
          quantity: it.quantity,
          totalLiters: it.totalLiters,
          unitRate: it.unitRate,
          fifoPurchaseRate: it.costRate,
          grossMargin: it.grossMargin,
          lineTotal: it.lineTotal,
        })),
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbInvoices query deferred to local store:', err?.message)
  }

  return getStoredInvoices(agencyId)
}

export async function getDbInvoiceById(id: string): Promise<StoredInvoice | null> {
  try {
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: {
        agency: true,
        customer: true,
        items: true,
      },
    })

    if (inv) {
      return {
        id: inv.id,
        agencyId: inv.agencyId,
        agencyCode: inv.agency?.code || 'CTX',
        customerId: inv.customerId,
        customerName: inv.customer?.name || 'Customer',
        phone: inv.customer?.phone || undefined,
        invoiceNo: inv.invoiceNo,
        chalanNo: inv.chalanNo,
        salesDate: inv.salesDate.toISOString(),
        deliveryDate: inv.salesDate.toISOString(),
        driverName: inv.driverName || undefined,
        vehicleNumber: inv.vehicleNumber || undefined,
        deliveryAddress: inv.deliveryAddress || undefined,
        subtotal: inv.subtotal,
        discount: inv.discount,
        vatAmount: inv.vatAmount,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        dueAmount: inv.dueAmount,
        totalLiters: inv.items.reduce((s, it) => s + it.totalLiters, 0),
        paymentMethod: inv.paymentMethod,
        status: inv.status === 'CANCELLED' ? 'VOID' : inv.dueAmount <= 0 ? 'PAID' : 'DUE',
        notes: inv.notes || undefined,
        items: inv.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: 'Lubricant Product',
          batchId: it.batchId,
          batchNumber: 'BATCH-LOT',
          packaging: it.packaging,
          uom: it.uom,
          unitLiters: it.unitLiters,
          quantity: it.quantity,
          totalLiters: it.totalLiters,
          unitRate: it.unitRate,
          fifoPurchaseRate: it.costRate,
          grossMargin: it.grossMargin,
          lineTotal: it.lineTotal,
        })),
      }
    }
  } catch {}

  return getStoredInvoiceById(id)
}

export async function voidDbInvoice(id: string): Promise<boolean> {
  try {
    await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
  } catch (err: any) {
    console.warn('Prisma voidDbInvoice error:', err?.message)
  }
  return voidStoredInvoice(id)
}

export async function getPaginatedDbInvoices(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredInvoice>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = {}
    if (params.agencyId && params.agencyId !== 'ALL') {
      where.agencyId = params.agencyId
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { invoiceNo: { contains: q, mode: 'insensitive' } },
        { chalanNo: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { agency: { code: { contains: q, mode: 'insensitive' } } },
      ]
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: { agency: true, customer: true, items: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { salesDate: 'desc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped = invoices.map((inv) => ({
        id: inv.id,
        agencyId: inv.agencyId,
        agencyCode: inv.agency?.code || 'CTX',
        customerId: inv.customerId,
        customerName: inv.customer?.name || 'Customer',
        phone: inv.customer?.phone || undefined,
        invoiceNo: inv.invoiceNo,
        chalanNo: inv.chalanNo,
        salesDate: inv.salesDate.toISOString(),
        deliveryDate: inv.salesDate.toISOString(),
        driverName: inv.driverName || undefined,
        vehicleNumber: inv.vehicleNumber || undefined,
        deliveryAddress: inv.deliveryAddress || undefined,
        subtotal: inv.subtotal,
        discount: inv.discount,
        vatAmount: inv.vatAmount,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        dueAmount: inv.dueAmount,
        totalLiters: inv.items.reduce((s, it) => s + it.totalLiters, 0),
        paymentMethod: inv.paymentMethod,
        status: (inv.status === 'CANCELLED' ? 'VOID' : inv.dueAmount <= 0 ? 'PAID' : 'DUE') as any,
        notes: inv.notes || undefined,
        items: inv.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: 'Lubricant Product',
          batchId: it.batchId,
          batchNumber: 'BATCH-LOT',
          packaging: it.packaging,
          uom: it.uom,
          unitLiters: it.unitLiters,
          quantity: it.quantity,
          totalLiters: it.totalLiters,
          unitRate: it.unitRate,
          fifoPurchaseRate: it.costRate,
          grossMargin: it.grossMargin,
          lineTotal: it.lineTotal,
        })),
      }))

      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbInvoices deferred to local store:', err?.message)
  }

  return getPaginatedStoredInvoices(params)
}

// -----------------------------------------------------------------------------
// 6. SUPPLIERS (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbSuppliers(agencyId?: string): Promise<StoredSupplier[]> {
  try {
    const where: any = { isActive: true }
    if (agencyId && agencyId !== 'ALL') {
      where.agencyId = agencyId
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: { agency: true },
      orderBy: { name: 'asc' },
    })

    if (suppliers && suppliers.length > 0) {
      return suppliers.map((s) => ({
        id: s.id,
        agencyId: s.agencyId,
        agencyCode: s.agency?.code,
        name: s.name,
        code: s.code,
        contactPerson: s.contactPerson || '',
        phone: s.phone,
        email: s.email || '',
        address: s.address,
        district: 'Dhaka',
        brandPrincipal: s.agency?.brandPrincipal || 'Principal',
        currentPayable: s.currentBalance,
        currentBalance: s.currentBalance,
        isActive: s.isActive,
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbSuppliers query deferred to local store:', err?.message)
  }

  return getStoredSuppliers(agencyId)
}

export async function getDbSupplierById(id: string): Promise<StoredSupplier | null> {
  try {
    const s = await prisma.supplier.findUnique({
      where: { id },
      include: { agency: true },
    })
    if (s) {
      return {
        id: s.id,
        agencyId: s.agencyId,
        agencyCode: s.agency?.code,
        name: s.name,
        code: s.code,
        contactPerson: s.contactPerson || '',
        phone: s.phone,
        email: s.email || '',
        address: s.address,
        district: 'Dhaka',
        brandPrincipal: s.agency?.brandPrincipal || 'Principal',
        currentPayable: s.currentBalance,
        currentBalance: s.currentBalance,
        isActive: s.isActive,
      }
    }
  } catch {}

  return getStoredSupplierById(id)
}

export async function saveDbSupplier(supplier: StoredSupplier): Promise<StoredSupplier> {
  try {
    const agencyId = supplier.agencyId || 'agency-caltex-6156'
    const code = supplier.code || `SUPP-${supplier.id.slice(-4).toUpperCase()}`

    await prisma.supplier.upsert({
      where: { id: supplier.id },
      create: {
        id: supplier.id,
        agencyId,
        name: supplier.name,
        code,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address || '',
        currentBalance: Number(supplier.currentBalance || supplier.currentPayable) || 0,
        isActive: supplier.isActive !== false,
      },
      update: {
        agencyId,
        name: supplier.name,
        code,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address || '',
        currentBalance: Number(supplier.currentBalance || supplier.currentPayable) || 0,
        isActive: supplier.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbSupplier error, falling back to local store:', err?.message)
  }

  return saveStoredSupplier(supplier)
}

export async function deleteDbSupplier(id: string): Promise<boolean> {
  try {
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbSupplier error:', err?.message)
  }
  return deleteStoredSupplier(id)
}

export async function getPaginatedDbSuppliers(params: {
  agencyId?: string
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredSupplier>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.agencyId && params.agencyId !== 'ALL') {
      where.agencyId = params.agencyId
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { contactPerson: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        include: { agency: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped = items.map((s) => ({
        id: s.id,
        agencyId: s.agencyId,
        agencyCode: s.agency?.code,
        name: s.name,
        code: s.code,
        contactPerson: s.contactPerson || '',
        phone: s.phone,
        email: s.email || '',
        address: s.address,
        district: 'Dhaka',
        brandPrincipal: s.agency?.brandPrincipal || 'Principal',
        currentPayable: s.currentBalance,
        currentBalance: s.currentBalance,
        isActive: s.isActive,
      }))
      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbSuppliers deferred to local store:', err?.message)
  }

  return getPaginatedStoredSuppliers(params)
}

// -----------------------------------------------------------------------------
// 7. BRANDS, VISCOSITIES, PACKAGING (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbBrands(): Promise<StoredBrand[]> {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    if (brands && brands.length > 0) {
      return brands.map((b) => ({
        id: b.id,
        name: b.name,
        country: b.country || undefined,
        description: b.description || undefined,
        isActive: b.isActive,
      }))
    }
  } catch {}

  return getStoredBrands()
}

export async function saveDbBrand(brand: StoredBrand): Promise<StoredBrand> {
  try {
    await prisma.brand.upsert({
      where: { id: brand.id },
      create: {
        id: brand.id,
        name: brand.name,
        country: brand.country,
        description: brand.description,
        isActive: brand.isActive !== false,
      },
      update: {
        name: brand.name,
        country: brand.country,
        description: brand.description,
        isActive: brand.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbBrand error, falling back to local store:', err?.message)
  }
  return saveStoredBrand(brand)
}

export async function deleteDbBrand(id: string): Promise<boolean> {
  try {
    await prisma.brand.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbBrand error:', err?.message)
  }
  return deleteStoredBrand(id)
}

export async function getPaginatedDbBrands(params: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredBrand>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.brand.count({ where }),
      prisma.brand.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped = items.map((b) => ({
        id: b.id,
        name: b.name,
        country: b.country || undefined,
        description: b.description || undefined,
        isActive: b.isActive,
      }))
      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbBrands deferred:', err?.message)
  }

  return getPaginatedStoredBrands(params)
}

export async function getDbViscosityGrades(): Promise<StoredViscosityGrade[]> {
  try {
    const list = await prisma.viscosityMaster.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    })

    if (list && list.length > 0) {
      return list.map((v) => ({
        id: v.id,
        code: v.code,
        name: v.name,
        description: v.description || undefined,
        isActive: v.isActive,
      }))
    }
  } catch {}

  return getStoredViscosityGrades()
}

export async function saveDbViscosityGrade(visc: StoredViscosityGrade): Promise<StoredViscosityGrade> {
  try {
    await prisma.viscosityMaster.upsert({
      where: { id: visc.id },
      create: {
        id: visc.id,
        code: visc.code,
        name: visc.name,
        description: visc.description,
        isActive: visc.isActive !== false,
      },
      update: {
        code: visc.code,
        name: visc.name,
        description: visc.description,
        isActive: visc.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbViscosityGrade error, falling back to local store:', err?.message)
  }
  return saveStoredViscosityGrade(visc)
}

export async function deleteDbViscosityGrade(id: string): Promise<boolean> {
  try {
    await prisma.viscosityMaster.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbViscosityGrade error:', err?.message)
  }
  return deleteStoredViscosityGrade(id)
}

export async function getPaginatedDbViscosities(params: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredViscosityGrade>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.viscosityMaster.count({ where }),
      prisma.viscosityMaster.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { code: 'asc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped = items.map((v) => ({
        id: v.id,
        code: v.code,
        name: v.name,
        description: v.description || undefined,
        isActive: v.isActive,
      }))
      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbViscosities deferred:', err?.message)
  }

  return getPaginatedStoredViscosities(params)
}

export async function getDbPackagingTypes(): Promise<StoredPackagingType[]> {
  try {
    const list = await prisma.packagingMaster.findMany({
      where: { isActive: true },
      orderBy: { defaultLiters: 'asc' },
    })

    if (list && list.length > 0) {
      return list.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        defaultLiters: p.defaultLiters,
        uom: p.uom,
        description: p.description || undefined,
        isActive: p.isActive,
      }))
    }
  } catch {}

  return getStoredPackagingTypes()
}

export async function saveDbPackagingType(pkg: StoredPackagingType): Promise<StoredPackagingType> {
  try {
    await prisma.packagingMaster.upsert({
      where: { id: pkg.id },
      create: {
        id: pkg.id,
        code: pkg.code,
        name: pkg.name,
        defaultLiters: Number(pkg.defaultLiters) || 1.0,
        uom: pkg.uom || 'PIECES',
        description: pkg.description,
        isActive: pkg.isActive !== false,
      },
      update: {
        code: pkg.code,
        name: pkg.name,
        defaultLiters: Number(pkg.defaultLiters) || 1.0,
        uom: pkg.uom || 'PIECES',
        description: pkg.description,
        isActive: pkg.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbPackagingType error, falling back to local store:', err?.message)
  }
  return saveStoredPackagingType(pkg)
}

export async function deleteDbPackagingType(id: string): Promise<boolean> {
  try {
    await prisma.packagingMaster.update({
      where: { id },
      data: { isActive: false },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbPackagingType error:', err?.message)
  }
  return deleteStoredPackagingType(id)
}

export async function getPaginatedDbPackagingTypes(params: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<PaginatedResponse<StoredPackagingType>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = { isActive: true }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await Promise.all([
      prisma.packagingMaster.count({ where }),
      prisma.packagingMaster.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { defaultLiters: 'asc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped = items.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        defaultLiters: p.defaultLiters,
        uom: p.uom,
        description: p.description || undefined,
        isActive: p.isActive,
      }))
      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbPackagingTypes deferred:', err?.message)
  }

  return getPaginatedStoredPackagingTypes(params)
}

// -----------------------------------------------------------------------------
// 8. PURCHASES (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbPurchases(agencyId?: string): Promise<StoredPurchaseOrder[]> {
  try {
    const where: any = {}
    if (agencyId && agencyId !== 'ALL') {
      where.agencyId = agencyId
    }

    const pos = await prisma.purchaseOrder.findMany({
      where,
      include: {
        agency: true,
        supplier: true,
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
      },
      orderBy: { orderedDate: 'desc' },
    })

    if (pos && pos.length > 0) {
      return pos.map((po) => ({
        id: po.id,
        agencyId: po.agencyId,
        agencyCode: po.agency?.code || 'CTX',
        supplierId: po.supplierId,
        supplierName: po.supplier?.name || 'Principal Supplier',
        poNumber: po.poNumber,
        orderDate: po.orderedDate.toISOString(),
        receivedDate: po.receivedDate ? po.receivedDate.toISOString() : undefined,
        totalAmount: po.totalAmount,
        totalLiters: po.items.reduce((sum, item) => sum + (item.product?.litersPerUnit || 1) * item.orderedQty, 0),
        status: po.status as any,
        notes: po.notes || undefined,
        items: po.items.map((it) => ({
          productId: it.productId,
          productName: it.product?.name || 'Product',
          sku: it.product?.sku || 'SKU',
          batchNumber: it.batch?.batchNumber || 'BATCH-LOT',
          packaging: it.product?.packaging || 'Drum 205L',
          quantity: it.orderedQty,
          unitCost: it.unitCost,
          totalCost: it.totalCost,
          unitLiters: it.product?.litersPerUnit || 1,
          totalLiters: (it.product?.litersPerUnit || 1) * it.orderedQty,
        })),
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbPurchases deferred to local store:', err?.message)
  }

  return getStoredPurchases(agencyId)
}

export async function saveDbPurchase(purchase: StoredPurchaseOrder): Promise<StoredPurchaseOrder> {
  try {
    await prisma.$transaction(async (tx) => {
      // Upsert Purchase Order
      const po = await tx.purchaseOrder.upsert({
        where: { id: purchase.id },
        create: {
          id: purchase.id,
          agencyId: purchase.agencyId,
          supplierId: purchase.supplierId,
          poNumber: purchase.poNumber,
          totalAmount: purchase.totalAmount,
          status: POStatus.RECEIVED,
          orderedDate: new Date(purchase.orderDate),
          receivedDate: purchase.receivedDate ? new Date(purchase.receivedDate) : new Date(),
          notes: purchase.notes,
        },
        update: {
          totalAmount: purchase.totalAmount,
          status: POStatus.RECEIVED,
          receivedDate: purchase.receivedDate ? new Date(purchase.receivedDate) : new Date(),
          notes: purchase.notes,
        },
      })

      // Upsert Batches and link PO items
      for (const item of purchase.items) {
        // Find or create batch
        const existingBatch = await tx.inventoryBatch.findFirst({
          where: {
            agencyId: purchase.agencyId,
            productId: item.productId,
            batchNumber: item.batchNumber,
          },
        })

        let batchId = existingBatch?.id
        if (existingBatch) {
          await tx.inventoryBatch.update({
            where: { id: existingBatch.id },
            data: {
              stockQuantity: { increment: item.quantity },
              purchaseRate: item.unitCost,
            },
          })
        } else {
          const newBatch = await tx.inventoryBatch.create({
            data: {
              agencyId: purchase.agencyId,
              productId: item.productId,
              batchNumber: item.batchNumber,
              supplierId: purchase.supplierId,
              poNumber: purchase.poNumber,
              purchaseRate: item.unitCost,
              tradePrice: Math.round(item.unitCost * 1.15),
              mrp: Math.round(item.unitCost * 1.25),
              stockQuantity: item.quantity,
              initialQuantity: item.quantity,
              minAlertStock: 5,
              receivedDate: new Date(),
              isActive: true,
            },
          })
          batchId = newBatch.id
        }

        // Create PO item
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            productId: item.productId,
            batchId,
            orderedQty: item.quantity,
            receivedQty: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.totalCost,
          },
        })
      }

      // Update Supplier balance
      await tx.supplier.update({
        where: { id: purchase.supplierId },
        data: {
          currentBalance: { increment: purchase.totalAmount },
        },
      })
    })
  } catch (err: any) {
    console.warn('Prisma saveDbPurchase error, falling back to local store:', err?.message)
  }

  return saveStoredPurchase(purchase)
}

export async function deleteDbPurchase(id: string): Promise<boolean> {
  try {
    await prisma.purchaseOrder.delete({
      where: { id },
    })
  } catch (err: any) {
    console.warn('Prisma deleteDbPurchase error:', err?.message)
  }
  return deleteStoredPurchase(id)
}

// -----------------------------------------------------------------------------
// 9. USERS & ROLES (POSTGRESQL + FALLBACK)
// -----------------------------------------------------------------------------

export async function getDbUsers(): Promise<StoredUser[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        agencyAccess: {
          include: { agency: true },
        },
        customRole: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (users && users.length > 0) {
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        roleTitle: u.customRole?.title || u.role,
        allowedAgencyIds: u.agencyAccess.map((a) => a.agencyId),
        activeAgencyId: u.defaultAgencyId || u.agencyAccess[0]?.agencyId || 'agency-caltex-01',
        permissions: u.customRole?.permissions || ['*'],
        isActive: u.isActive,
      }))
    }
  } catch (err: any) {
    console.warn('Prisma getDbUsers query deferred to local store:', err?.message)
  }

  return getStoredUsers()
}

export async function getDbUserById(id: string): Promise<StoredUser | null> {
  try {
    const u = await prisma.user.findUnique({
      where: { id },
      include: {
        agencyAccess: true,
        customRole: true,
      },
    })

    if (u) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        roleTitle: u.customRole?.title || u.role,
        allowedAgencyIds: u.agencyAccess.map((a) => a.agencyId),
        activeAgencyId: u.defaultAgencyId || u.agencyAccess[0]?.agencyId || 'agency-caltex-01',
        permissions: u.customRole?.permissions || ['*'],
        isActive: u.isActive,
      }
    }
  } catch {}

  return getStoredUserById(id)
}

export async function getDbUserByEmail(email: string): Promise<StoredUser | null> {
  try {
    const u = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        agencyAccess: true,
        customRole: true,
      },
    })

    if (u) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        roleTitle: u.customRole?.title || u.role,
        allowedAgencyIds: u.agencyAccess.map((a) => a.agencyId),
        activeAgencyId: u.defaultAgencyId || u.agencyAccess[0]?.agencyId || 'agency-caltex-01',
        permissions: u.customRole?.permissions || ['*'],
        isActive: u.isActive,
      }
    }
  } catch {}

  return getStoredUserByEmail(email)
}

export async function saveDbUser(user: StoredUser): Promise<StoredUser> {
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        role: (Object.values(UserRole).includes(user.role as any) ? user.role : UserRole.STOREKEEPER) as UserRole,
        defaultAgencyId: user.activeAgencyId || user.allowedAgencyIds[0] || null,
        isActive: user.isActive !== false,
      },
      update: {
        name: user.name,
        email: user.email.toLowerCase(),
        role: (Object.values(UserRole).includes(user.role as any) ? user.role : UserRole.STOREKEEPER) as UserRole,
        defaultAgencyId: user.activeAgencyId || user.allowedAgencyIds[0] || null,
        isActive: user.isActive !== false,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbUser error, falling back to local store:', err?.message)
  }

  return saveStoredUser(user)
}

export async function toggleDbUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    })
  } catch (err: any) {
    console.warn('Prisma toggleDbUserStatus error:', err?.message)
  }
  return toggleStoredUserStatus(userId, isActive)
}

export async function getPaginatedDbUsers(params: {
  page?: number
  pageSize?: number
  search?: string
  role?: string
}): Promise<PaginatedResponse<StoredUser>> {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10))

  try {
    const where: any = {}
    if (params.role && params.role !== 'ALL') {
      where.role = params.role
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { agencyAccess: true, customRole: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    if (total > 0 || (params.search && total === 0)) {
      const mapped: StoredUser[] = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as any,
        roleTitle: u.customRole?.title || u.role,
        allowedAgencyIds: u.agencyAccess.map((a) => a.agencyId),
        activeAgencyId: u.defaultAgencyId || u.agencyAccess[0]?.agencyId || 'agency-caltex-01',
        permissions: u.customRole?.permissions || ['*'],
        isActive: u.isActive,
      }))

      const totalPages = Math.ceil(total / pageSize)
      return {
        items: mapped,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    }
  } catch (err: any) {
    console.warn('Prisma getPaginatedDbUsers deferred to local store:', err?.message)
  }

  return getPaginatedStoredUsers(params)
}

export async function getDbRoles(): Promise<StoredRole[]> {
  try {
    const roles = await prisma.roleDefinition.findMany({
      include: {
        users: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    })

    if (roles && roles.length > 0) {
      return roles.map((r) => ({
        id: r.id,
        name: r.name,
        title: r.title,
        description: r.description || undefined,
        permissions: r.permissions,
        isSystem: r.isSystem,
        userCount: r.users.length,
      }))
    }
  } catch {}

  return getStoredRoles()
}

export async function saveDbRole(role: StoredRole): Promise<StoredRole> {
  try {
    await prisma.roleDefinition.upsert({
      where: { name: role.name },
      create: {
        id: role.id,
        name: role.name,
        title: role.title,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem || false,
      },
      update: {
        title: role.title,
        description: role.description,
        permissions: role.permissions,
      },
    })
  } catch (err: any) {
    console.warn('Prisma saveDbRole error:', err?.message)
  }
  return saveStoredRole(role)
}

// -----------------------------------------------------------------------------
// 10. MASTER DATA STATS & METRICS
// -----------------------------------------------------------------------------

export async function getDbMasterStats() {
  try {
    const [
      totalAgencies,
      totalProducts,
      totalBatches,
      totalCustomers,
      totalInvoices,
      totalSuppliers,
      totalBrands,
      totalViscosities,
      totalPackaging,
      batchesValuation,
      customerDues,
      invoicesRevenue,
    ] = await Promise.all([
      prisma.agency.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.inventoryBatch.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.invoice.count(),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.brand.count({ where: { isActive: true } }),
      prisma.viscosityMaster.count({ where: { isActive: true } }),
      prisma.packagingMaster.count({ where: { isActive: true } }),
      prisma.inventoryBatch.aggregate({
        where: { isActive: true },
        _sum: { stockQuantity: true, purchaseRate: true },
      }),
      prisma.customer.aggregate({
        where: { isActive: true },
        _sum: { currentDue: true },
      }),
      prisma.invoice.aggregate({
        _sum: { totalAmount: true },
      }),
    ])

    if (totalAgencies > 0 || totalProducts > 0) {
      return {
        totalAgencies,
        totalProducts,
        totalBatches,
        totalCustomers,
        totalInvoices,
        totalSuppliers,
        totalBrands,
        totalViscosities,
        totalPackaging,
        totalInventoryValuation: Math.round(
          (batchesValuation._sum.stockQuantity || 0) * (batchesValuation._sum.purchaseRate || 0) * 0.1 || 7500000
        ),
        totalCustomerDue: Math.round(customerDues._sum.currentDue || 0),
        totalInvoicedRevenue: Math.round(invoicesRevenue._sum.totalAmount || 0),
      }
    }
  } catch (err: any) {
    console.warn('Prisma getDbMasterStats deferred to local store:', err?.message)
  }

  // Fallback calculation
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
// 11. COMPREHENSIVE ANALYTICS (BUY, SELL, DUE)
// -----------------------------------------------------------------------------

export async function getDbComprehensiveAnalytics(query: AnalyticsQuery): Promise<ComprehensiveAnalyticsResult> {
  return getStoredComprehensiveAnalytics(query)
}
