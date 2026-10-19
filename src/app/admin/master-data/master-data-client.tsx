'use client'

import * as React from 'react'
import {
  Crown,
  Building2,
  Boxes,
  Layers,
  Users,
  FileText,
  Truck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  X,
  CreditCard,
  ShieldCheck,
  Award,
  Gauge,
  Package,
  ShoppingCart,
} from 'lucide-react'
import { AuthUser } from '@/lib/auth-types'
import {
  createMasterAgency,
  updateMasterAgency,
  deleteMasterAgency,
  createMasterProduct,
  updateMasterProduct,
  deleteMasterProduct,
  createMasterBatch,
  updateMasterBatch,
  deleteMasterBatch,
  createMasterCustomer,
  updateMasterCustomer,
  deleteMasterCustomer,
  voidMasterInvoice,
  createMasterSupplier,
  updateMasterSupplier,
  deleteMasterSupplier,
  createMasterBrand,
  updateMasterBrand,
  deleteMasterBrand,
  createMasterViscosityGrade,
  updateMasterViscosityGrade,
  deleteMasterViscosityGrade,
  createMasterPackagingType,
  updateMasterPackagingType,
  deleteMasterPackagingType,
} from '@/actions/master-data'
import {
  ViscosityGrade,
  ApplicationSegment,
  PackagingType,
  UnitOfMeasure,
  VehicleTypeFocus,
} from '@prisma/client'
import { Pagination, paginateList } from '@/components/ui/pagination'

interface MasterDataClientProps {
  currentUser: AuthUser
  initialStats: any
  initialAgencies: any[]
  initialProducts: any[]
  initialBatches: any[]
  initialCustomers: any[]
  initialInvoices: any[]
  initialSuppliers: any[]
  initialBrands?: any[]
  initialViscosities?: any[]
  initialPackagingTypes?: any[]
}

type TabType =
  | 'agencies'
  | 'products'
  | 'batches'
  | 'customers'
  | 'invoices'
  | 'suppliers'

type ProductSubTab = 'catalog' | 'brands' | 'viscosities' | 'packaging'

export function MasterDataClient({
  currentUser,
  initialStats,
  initialAgencies,
  initialProducts,
  initialBatches,
  initialCustomers,
  initialInvoices,
  initialSuppliers,
  initialBrands = [],
  initialViscosities = [],
  initialPackagingTypes = [],
}: MasterDataClientProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('agencies')
  const [productSubTab, setProductSubTab] = React.useState<ProductSubTab>('catalog')
  const [selectedAgencyFilter, setSelectedAgencyFilter] = React.useState<string>('ALL')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [isPending, startTransition] = React.useTransition()
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Local state for instant optimistic updates
  const [agencies, setAgencies] = React.useState(initialAgencies)
  const [products, setProducts] = React.useState(initialProducts)
  const [batches, setBatches] = React.useState(initialBatches)
  const [customers, setCustomers] = React.useState(initialCustomers)
  const [invoices, setInvoices] = React.useState(initialInvoices)
  const [suppliers, setSuppliers] = React.useState(initialSuppliers)
  const [brands, setBrands] = React.useState(initialBrands)
  const [viscosities, setViscosities] = React.useState(initialViscosities)
  const [packagingTypes, setPackagingTypes] = React.useState(initialPackagingTypes)

  // Modal States
  const [activeModal, setActiveModal] = React.useState<string | null>(null)
  const [editingItem, setEditingItem] = React.useState<any>(null)
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    type: TabType | 'brands' | 'viscosities' | 'packaging'
    id: string
    title: string
  } | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Filtered lists
  const filteredAgencies = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.binNo.includes(searchTerm)
  )

  const filteredProducts = products.filter((p) => {
    const matchesAgency =
      selectedAgencyFilter === 'ALL' || p.agencyId === selectedAgencyFilter
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAgency && matchesSearch
  })

  const filteredBatches = batches.filter((b) => {
    const matchesAgency =
      selectedAgencyFilter === 'ALL' || b.agencyId === selectedAgencyFilter
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAgency && matchesSearch
  })

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.proprietor && c.proprietor.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredInvoices = invoices.filter((inv) => {
    const matchesAgency =
      selectedAgencyFilter === 'ALL' || inv.agencyId === selectedAgencyFilter
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.chalanNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAgency && matchesSearch
  })

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesAgency =
      selectedAgencyFilter === 'ALL' || s.agencyId === selectedAgencyFilter
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesAgency && matchesSearch
  })

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.country && b.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredViscosities = viscosities.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredPackagingTypes = packagingTypes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // ---------------------------------------------------------------------------
  // BACKEND PAGINATION STATE FOR ALL MASTER DATA GRIDS
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = React.useState({
    agencies: { page: 1, pageSize: 10 },
    products: { page: 1, pageSize: 10 },
    brands: { page: 1, pageSize: 10 },
    viscosities: { page: 1, pageSize: 10 },
    packagingTypes: { page: 1, pageSize: 10 },
    batches: { page: 1, pageSize: 10 },
    customers: { page: 1, pageSize: 10 },
    invoices: { page: 1, pageSize: 10 },
    suppliers: { page: 1, pageSize: 10 },
  })

  const updatePagination = (key: keyof typeof pagination, page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      [key]: {
        page,
        pageSize: pageSize ?? prev[key].pageSize,
      },
    }))
  }

  // Reset page to 1 when search term or agency filter changes
  React.useEffect(() => {
    setPagination((prev) => ({
      agencies: { ...prev.agencies, page: 1 },
      products: { ...prev.products, page: 1 },
      brands: { ...prev.brands, page: 1 },
      viscosities: { ...prev.viscosities, page: 1 },
      packagingTypes: { ...prev.packagingTypes, page: 1 },
      batches: { ...prev.batches, page: 1 },
      customers: { ...prev.customers, page: 1 },
      invoices: { ...prev.invoices, page: 1 },
      suppliers: { ...prev.suppliers, page: 1 },
    }))
  }, [searchTerm, selectedAgencyFilter])

  // Computed Paginated Data Slices
  const paginatedAgencies = React.useMemo(
    () => paginateList(filteredAgencies, pagination.agencies.page, pagination.agencies.pageSize),
    [filteredAgencies, pagination.agencies]
  )
  const paginatedProducts = React.useMemo(
    () => paginateList(filteredProducts, pagination.products.page, pagination.products.pageSize),
    [filteredProducts, pagination.products]
  )
  const paginatedBrands = React.useMemo(
    () => paginateList(filteredBrands, pagination.brands.page, pagination.brands.pageSize),
    [filteredBrands, pagination.brands]
  )
  const paginatedViscosities = React.useMemo(
    () => paginateList(filteredViscosities, pagination.viscosities.page, pagination.viscosities.pageSize),
    [filteredViscosities, pagination.viscosities]
  )
  const paginatedPackagingTypes = React.useMemo(
    () => paginateList(filteredPackagingTypes, pagination.packagingTypes.page, pagination.packagingTypes.pageSize),
    [filteredPackagingTypes, pagination.packagingTypes]
  )
  const paginatedBatches = React.useMemo(
    () => paginateList(filteredBatches, pagination.batches.page, pagination.batches.pageSize),
    [filteredBatches, pagination.batches]
  )
  const paginatedCustomers = React.useMemo(
    () => paginateList(filteredCustomers, pagination.customers.page, pagination.customers.pageSize),
    [filteredCustomers, pagination.customers]
  )
  const paginatedInvoices = React.useMemo(
    () => paginateList(filteredInvoices, pagination.invoices.page, pagination.invoices.pageSize),
    [filteredInvoices, pagination.invoices]
  )
  const paginatedSuppliers = React.useMemo(
    () => paginateList(filteredSuppliers, pagination.suppliers.page, pagination.suppliers.pageSize),
    [filteredSuppliers, pagination.suppliers]
  )

  // Product Form Reactive States for Packaging Auto-fill
  const [productFormPackaging, setProductFormPackaging] = React.useState<string>('CAN_4L')
  const [productFormLiters, setProductFormLiters] = React.useState<number>(4.0)
  const [productFormUom, setProductFormUom] = React.useState<string>('PIECES')

  React.useEffect(() => {
    if (activeModal === 'products') {
      if (editingItem) {
        setProductFormPackaging(editingItem.packaging || packagingTypes[0]?.code || 'CAN_4L')
        setProductFormLiters(editingItem.litersPerUnit ?? 4.0)
        setProductFormUom(editingItem.uom || 'PIECES')
      } else {
        const defaultPkg = packagingTypes[0] || { code: 'CAN_4L', defaultLiters: 4.0, uom: 'PIECES' }
        setProductFormPackaging(defaultPkg.code)
        setProductFormLiters(defaultPkg.defaultLiters)
        setProductFormUom(defaultPkg.uom)
      }
    }
  }, [activeModal, editingItem, packagingTypes])

  // ---------------------------------------------------------------------------
  // CRUD HANDLERS
  // ---------------------------------------------------------------------------

  // 1. Agency Submit
  const handleSaveAgency = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      brandPrincipal: formData.get('brandPrincipal') as string,
      tradeLicense: formData.get('tradeLicense') as string,
      binNo: formData.get('binNo') as string,
      tinNo: formData.get('tinNo') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      district: formData.get('district') as string,
      brandColor: formData.get('brandColor') as string,
      bankName: formData.get('bankName') as string,
      bankAccountName: formData.get('bankAccountName') as string,
      bankAccountNo: formData.get('bankAccountNo') as string,
      bankBranch: formData.get('bankBranch') as string,
      bankRoutingNo: formData.get('bankRoutingNo') as string,
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          await updateMasterAgency(editingItem.id, payload)
          setAgencies((prev) =>
            prev.map((a) => (a.id === editingItem.id ? { ...a, ...payload } : a))
          )
          showToast(`Agency "${payload.name}" updated successfully.`)
        } else {
          const res = await createMasterAgency(payload)
          if (res.agency) setAgencies((prev) => [res.agency, ...prev])
          showToast(`Dealership agency "${payload.name}" registered.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save agency')
      }
    })
  }

  // 2. Product Submit
  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      agencyId: formData.get('agencyId') as string,
      brand: formData.get('brand') as string,
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      viscosityGrade: formData.get('viscosityGrade') as string,
      applicationSegment: formData.get('applicationSegment') as string,
      packaging: formData.get('packaging') as string,
      uom: formData.get('uom') as string,
      litersPerUnit: parseFloat(formData.get('litersPerUnit') as string) || 1,
      minAlertStock: parseFloat(formData.get('minAlertStock') as string) || 5,
      isDecantable: formData.get('isDecantable') === 'on',
      isLoose: formData.get('isLoose') === 'on',
      description: formData.get('description') as string,
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          await updateMasterProduct(editingItem.id, payload)
          setProducts((prev) =>
            prev.map((p) => (p.id === editingItem.id ? { ...p, ...payload } : p))
          )
          showToast(`SKU "${payload.sku}" updated.`)
        } else {
          const res = await createMasterProduct(payload)
          if (res.product) {
            const agency = agencies.find((a) => a.id === payload.agencyId)
            setProducts((prev) => [{ ...res.product, agency }, ...prev])
          }
          showToast(`Lubricant SKU "${payload.sku}" added to catalog.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save product')
      }
    })
  }

  // 3. Batch / Inward Purchase Submit
  const handleSaveBatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      agencyId: formData.get('agencyId') as string,
      productId: formData.get('productId') as string,
      supplierId: (formData.get('supplierId') as string) || undefined,
      batchNumber: (formData.get('batchNumber') as string).trim(),
      purchaseRate: parseFloat(formData.get('purchaseRate') as string) || 0,
      tradePrice: parseFloat(formData.get('tradePrice') as string) || 0,
      mrp: parseFloat(formData.get('mrp') as string) || 0,
      stockQuantity: parseFloat(formData.get('stockQuantity') as string) || 0,
      minAlertStock: parseFloat(formData.get('minAlertStock') as string) || 5,
      receivedDate: (formData.get('receivedDate') as string) || new Date().toISOString().slice(0, 10),
      poNumber: (formData.get('poNumber') as string)?.trim() || undefined,
      notes: (formData.get('notes') as string)?.trim() || undefined,
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          await updateMasterBatch(editingItem.id, payload)
          setBatches((prev) =>
            prev.map((b) => (b.id === editingItem.id ? { ...b, ...payload } : b))
          )
          showToast(`Batch "${payload.batchNumber}" rates & stock updated.`)
        } else {
          const res = await createMasterBatch(payload)
          if (res.batch) {
            const prod = products.find((p) => p.id === payload.productId)
            const agency = agencies.find((a) => a.id === payload.agencyId)
            const supplier = suppliers.find((s) => s.id === payload.supplierId)
            setBatches((prev) => [
              { ...res.batch, product: prod, agency, supplier },
              ...prev,
            ])
            // Update local supplier payable balance
            if (payload.supplierId) {
              const addedCost = payload.stockQuantity * payload.purchaseRate
              setSuppliers((prev) =>
                prev.map((s) =>
                  s.id === payload.supplierId
                    ? { ...s, currentBalance: (Number(s.currentBalance) || 0) + addedCost }
                    : s
                )
              )
            }
          }
          const totalVal = (payload.stockQuantity * payload.purchaseRate).toLocaleString()
          showToast(`Inward purchase & batch "${payload.batchNumber}" logged (৳${totalVal}). Stock & Buy analytics updated.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save batch')
      }
    })
  }

  // 4. Customer Submit
  const handleSaveCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: formData.get('name') as string,
      proprietor: formData.get('proprietor') as string,
      phone: formData.get('phone') as string,
      secondaryPhone: formData.get('secondaryPhone') as string,
      address: formData.get('address') as string,
      district: formData.get('district') as string,
      vehicleTypeFocus: formData.get('vehicleTypeFocus') as string,
      totalCreditLimit: parseFloat(formData.get('totalCreditLimit') as string) || 0,
      tradeLicense: formData.get('tradeLicense') as string,
      binNo: formData.get('binNo') as string,
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          await updateMasterCustomer(editingItem.id, payload)
          setCustomers((prev) =>
            prev.map((c) => (c.id === editingItem.id ? { ...c, ...payload } : c))
          )
          showToast(`Customer account "${payload.name}" updated.`)
        } else {
          const res = await createMasterCustomer(payload)
          if (res.customer) setCustomers((prev) => [res.customer, ...prev])
          showToast(`Customer "${payload.name}" registered with ৳${payload.totalCreditLimit.toLocaleString()} credit limit.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save customer')
      }
    })
  }

  // 5. Supplier Submit
  const handleSaveSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      agencyId: formData.get('agencyId') as string,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      currentBalance: parseFloat(formData.get('currentBalance') as string) || 0,
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          await updateMasterSupplier(editingItem.id, payload)
          setSuppliers((prev) =>
            prev.map((s) => (s.id === editingItem.id ? { ...s, ...payload } : s))
          )
          showToast(`Supplier profile "${payload.name}" updated.`)
        } else {
          const res = await createMasterSupplier(payload)
          if (res.supplier) {
            const agency = agencies.find((a) => a.id === payload.agencyId)
            setSuppliers((prev) => [{ ...res.supplier, agency }, ...prev])
          }
          showToast(`Brand principal supplier "${payload.name}" configured.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save supplier')
      }
    })
  }

  // Execute Deletion / Void
  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return
    const { type, id } = deleteConfirmation

    startTransition(async () => {
      try {
        if (type === 'agencies') {
          await deleteMasterAgency(id)
          setAgencies((prev) => prev.filter((a) => a.id !== id))
          showToast('Agency dealership deleted.')
        } else if (type === 'products') {
          await deleteMasterProduct(id)
          setProducts((prev) => prev.filter((p) => p.id !== id))
          showToast('Product SKU deleted from catalog.')
        } else if (type === 'batches') {
          await deleteMasterBatch(id)
          setBatches((prev) => prev.filter((b) => b.id !== id))
          showToast('Inventory batch deleted.')
        } else if (type === 'customers') {
          await deleteMasterCustomer(id)
          setCustomers((prev) => prev.filter((c) => c.id !== id))
          showToast('Customer profile deleted.')
        } else if (type === 'invoices') {
          const res = await voidMasterInvoice(id)
          setInvoices((prev) => prev.filter((inv) => inv.id !== id))
          showToast(res.message || 'Invoice voided and inventory reversed.')
        } else if (type === 'suppliers') {
          await deleteMasterSupplier(id)
          setSuppliers((prev) => prev.filter((s) => s.id !== id))
          showToast('Principal supplier removed.')
        } else if (type === 'brands') {
          await deleteMasterBrand(id)
          setBrands((prev) => prev.filter((b) => b.id !== id))
          showToast('Brand removed from master catalog.')
        } else if (type === 'viscosities') {
          await deleteMasterViscosityGrade(id)
          setViscosities((prev) => prev.filter((v) => v.id !== id))
          showToast('Viscosity grade removed from master catalog.')
        } else if (type === 'packaging') {
          await deleteMasterPackagingType(id)
          setPackagingTypes((prev) => prev.filter((p) => p.id !== id))
          showToast('Packaging type removed from master catalog.')
        }
      } catch (err: any) {
        alert(err?.message || 'Operation failed')
      } finally {
        setDeleteConfirmation(null)
      }
    })
  }

  // 6. Brand Submit
  const handleSaveBrand = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: (formData.get('name') as string).trim(),
      country: (formData.get('country') as string)?.trim() || '',
      description: (formData.get('description') as string)?.trim() || '',
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          const res = await updateMasterBrand(editingItem.id, payload)
          if (!res.success) {
            alert(res.error || 'Failed to update brand')
            return
          }
          setBrands((prev) =>
            prev.map((b) => (b.id === editingItem.id ? { ...b, ...payload } : b))
          )
          showToast(`Brand "${payload.name}" updated.`)
        } else {
          const res = await createMasterBrand(payload)
          if (!res.success) {
            alert(res.error || 'Failed to create brand')
            return
          }
          if (res.brand) setBrands((prev) => [res.brand, ...prev])
          showToast(`Brand "${payload.name}" registered.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save brand')
      }
    })
  }

  // 7. Viscosity Grade Submit
  const handleSaveViscosity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: (formData.get('name') as string).trim(),
      code: (formData.get('code') as string)?.trim() || '',
      description: (formData.get('description') as string)?.trim() || '',
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          const res = await updateMasterViscosityGrade(editingItem.id, payload)
          if (!res.success) {
            alert(res.error || 'Failed to update viscosity grade')
            return
          }
          setViscosities((prev) =>
            prev.map((v) => (v.id === editingItem.id ? { ...v, ...payload } : v))
          )
          showToast(`Viscosity grade "${payload.name}" updated.`)
        } else {
          const res = await createMasterViscosityGrade(payload)
          if (!res.success) {
            alert(res.error || 'Failed to create viscosity grade')
            return
          }
          if (res.viscosityGrade) setViscosities((prev) => [res.viscosityGrade, ...prev])
          showToast(`Viscosity grade "${payload.name}" registered.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save viscosity grade')
      }
    })
  }

  // 8. Packaging Type Submit
  const handleSavePackaging = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      name: (formData.get('name') as string).trim(),
      code: (formData.get('code') as string)?.trim() || '',
      defaultLiters: parseFloat(formData.get('defaultLiters') as string) || 1.0,
      uom: (formData.get('uom') as string) || 'PIECES',
      description: (formData.get('description') as string)?.trim() || '',
    }

    startTransition(async () => {
      try {
        if (editingItem) {
          const res = await updateMasterPackagingType(editingItem.id, payload)
          if (!res.success) {
            alert(res.error || 'Failed to update packaging type')
            return
          }
          setPackagingTypes((prev) =>
            prev.map((p) => (p.id === editingItem.id ? { ...p, ...payload } : p))
          )
          showToast(`Packaging type "${payload.name}" updated.`)
        } else {
          const res = await createMasterPackagingType(payload)
          if (!res.success) {
            alert(res.error || 'Failed to create packaging type')
            return
          }
          if (res.packagingType) setPackagingTypes((prev) => [res.packagingType, ...prev])
          showToast(`Packaging type "${payload.name}" registered.`)
        }
        setActiveModal(null)
        setEditingItem(null)
      } catch (err: any) {
        alert(err?.message || 'Failed to save packaging type')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shadow-2xl flex items-center gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white via-amber-500/5 to-zinc-50 dark:from-zinc-900 dark:via-amber-500/5 dark:to-zinc-950 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Super Admin Master Hub • Full CRUD Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              Master Data Management Center
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Proprietor-level control to create, update, inspect, and delete data entities across all authorized brand dealerships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditingItem(null)
                if (activeTab === 'products') {
                  setActiveModal(productSubTab === 'catalog' ? 'products' : productSubTab)
                } else {
                  setActiveModal(activeTab)
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>
                {activeTab === 'agencies'
                  ? 'Add Dealership'
                  : activeTab === 'products'
                  ? productSubTab === 'brands'
                    ? 'Register Brand'
                    : productSubTab === 'viscosities'
                    ? 'Register Viscosity Grade'
                    : productSubTab === 'packaging'
                    ? 'Configure Packaging Type'
                    : 'Add Product SKU'
                  : activeTab === 'batches'
                  ? 'Add Batch'
                  : activeTab === 'customers'
                  ? 'Add Customer'
                  : activeTab === 'suppliers'
                  ? 'Add Supplier'
                  : 'Add Record'}
              </span>
            </button>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="mt-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Agencies</span>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{agencies.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Products</span>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{products.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Batches</span>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{batches.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Customers</span>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{customers.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Invoices</span>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{invoices.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Suppliers</span>
            <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">{suppliers.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Entity Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/70 border border-zinc-300 dark:border-zinc-700/60 overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'agencies', label: 'Agencies', icon: Building2, count: agencies.length },
            { id: 'products', label: 'Products', icon: Boxes, count: products.length },
            { id: 'batches', label: 'Batches', icon: Layers, count: batches.length },
            { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
            { id: 'invoices', label: 'Invoices', icon: FileText, count: invoices.length },
            { id: 'suppliers', label: 'Suppliers', icon: Truck, count: suppliers.length },
          ].map((tab) => {
            const Icon = tab.icon
            const isCurrent = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType)
                  setSearchTerm('')
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isCurrent ? 'text-amber-500' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Dealership Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {['products', 'batches', 'invoices', 'suppliers'].includes(activeTab) && (
            <select
              value={selectedAgencyFilter}
              onChange={(e) => setSelectedAgencyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Dealerships</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} ({a.brandPrincipal})
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: AGENCIES CRUD TABLE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'agencies' && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-500" />
              <span>Authorized Dealership Agencies ({filteredAgencies.length})</span>
            </h3>
            <button
              onClick={() => {
                setEditingItem(null)
                setActiveModal('agencies')
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register New Dealership</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Dealership / Code</th>
                  <th className="py-3 px-4">Principal Brand</th>
                  <th className="py-3 px-4">BIN / TIN</th>
                  <th className="py-3 px-4">Trade License</th>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedAgencies.items.map((agency) => (
                  <tr key={agency.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: agency.brandColor || '#dc2626' }}
                        />
                        <span>{agency.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        Code: {agency.code} • {agency.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {agency.brandPrincipal}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      <div>BIN: {agency.binNo}</div>
                      {agency.tinNo && <div>TIN: {agency.tinNo}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {agency.tradeLicense}
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{agency.bankName || 'Islami Bank'}</div>
                      <div className="font-mono text-zinc-500">{agency.bankAccountNo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-zinc-500 max-w-xs truncate">
                      {agency.address}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingItem(agency)
                          setActiveModal('agencies')
                        }}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                        title="Edit Agency"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: 'agencies',
                            id: agency.id,
                            title: agency.name,
                          })
                        }
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                        title="Delete Agency"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={paginatedAgencies.page}
            totalPages={paginatedAgencies.totalPages}
            totalItems={paginatedAgencies.total}
            pageSize={paginatedAgencies.pageSize}
            onPageChange={(p) => updatePagination('agencies', p)}
            onPageSizeChange={(s) => updatePagination('agencies', 1, s)}
            itemName="dealership agencies"
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: PRODUCTS CRUD (WITH SUB-TABS: SKUs, BRANDS, VISCOSITIES, PACKAGING) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          {/* Sub-tabs header for Products section */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/60 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setProductSubTab('catalog')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  productSubTab === 'catalog'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Boxes className="h-3.5 w-3.5 text-amber-500" />
                <span>Product SKUs</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {filteredProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProductSubTab('brands')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  productSubTab === 'brands'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Brand Master</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {filteredBrands.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProductSubTab('viscosities')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  productSubTab === 'viscosities'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Gauge className="h-3.5 w-3.5 text-amber-500" />
                <span>Viscosity Grades</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {filteredViscosities.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProductSubTab('packaging')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  productSubTab === 'packaging'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Package className="h-3.5 w-3.5 text-amber-500" />
                <span>Packaging Types</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {filteredPackagingTypes.length}
                </span>
              </button>
            </div>

            {/* Quick Action Button per Sub-Tab */}
            <div className="shrink-0">
              {productSubTab === 'catalog' && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null)
                    setActiveModal('products')
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Product SKU</span>
                </button>
              )}
              {productSubTab === 'brands' && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null)
                    setActiveModal('brands')
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register Brand</span>
                </button>
              )}
              {productSubTab === 'viscosities' && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null)
                    setActiveModal('viscosities')
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register Viscosity Grade</span>
                </button>
              )}
              {productSubTab === 'packaging' && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null)
                    setActiveModal('packaging')
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Configure Packaging Type</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: PRODUCT SKUs TABLE */}
          {productSubTab === 'catalog' && (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Product Name / Brand</th>
                    <th className="py-3 px-4">SKU / Agency</th>
                    <th className="py-3 px-4">Viscosity Grade</th>
                    <th className="py-3 px-4">Packaging & UOM</th>
                    <th className="py-3 px-4">Liters / Unit</th>
                    <th className="py-3 px-4">Packaging Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedProducts.items.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                        <div className="text-[11px] text-zinc-500">{p.brand} • {p.applicationSegment}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{p.sku}</span>
                        <div className="text-[10px] text-zinc-500">{p.agency?.code || p.agencyId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                          {p.viscosityGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div>{p.packaging?.replace('_', ' ')}</div>
                        <div className="text-zinc-500 font-mono">{p.uom}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        {p.litersPerUnit} L
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold">
                          {p.packaging?.replace('_', ' ') || 'STANDARD'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingItem(p)
                            setActiveModal('products')
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'products',
                              id: p.id,
                              title: `${p.name} (${p.sku})`,
                            })
                          }
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={paginatedProducts.page}
              totalPages={paginatedProducts.totalPages}
              totalItems={paginatedProducts.total}
              pageSize={paginatedProducts.pageSize}
              onPageChange={(p) => updatePagination('products', p)}
              onPageSizeChange={(s) => updatePagination('products', 1, s)}
              itemName="product SKUs"
            />
            </>
          )}

          {/* VIEW 2: BRANDS CATALOG TABLE */}
          {productSubTab === 'brands' && (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Brand Name</th>
                    <th className="py-3 px-4">Country / Principal Origin</th>
                    <th className="py-3 px-4">Associated Products</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedBrands.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                        No brands found. Click &quot;Register Brand&quot; to add one.
                      </td>
                    </tr>
                  ) : (
                    paginatedBrands.items.map((b) => {
                      const productCount = products.filter(
                        (p) => p.brand?.toLowerCase() === b.name?.toLowerCase()
                      ).length
                      return (
                        <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>{b.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-zinc-700 dark:text-zinc-300">
                            {b.country || 'Global / Multinational'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              {productCount} SKUs
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 text-[11px] max-w-xs truncate">
                            {b.description || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingItem(b)
                                setActiveModal('brands')
                              }}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                              title="Edit Brand"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'brands',
                                  id: b.id,
                                  title: b.name,
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                              title="Delete Brand"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={paginatedBrands.page}
              totalPages={paginatedBrands.totalPages}
              totalItems={paginatedBrands.total}
              pageSize={paginatedBrands.pageSize}
              onPageChange={(p) => updatePagination('brands', p)}
              onPageSizeChange={(s) => updatePagination('brands', 1, s)}
              itemName="lubricant brands"
            />
            </>
          )}

          {/* VIEW 3: VISCOSITY GRADES TABLE */}
          {productSubTab === 'viscosities' && (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Grade Label</th>
                    <th className="py-3 px-4">System Code</th>
                    <th className="py-3 px-4">Associated Products</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedViscosities.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                        No viscosity grades found. Click &quot;Register Viscosity Grade&quot; to add one.
                      </td>
                    </tr>
                  ) : (
                    paginatedViscosities.items.map((v) => {
                      const productCount = products.filter(
                        (p) => p.viscosityGrade === v.code || p.viscosityGrade === v.name
                      ).length
                      return (
                        <tr key={v.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {v.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {v.code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              {productCount} SKUs
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500 text-[11px] max-w-xs truncate">
                            {v.description || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingItem(v)
                                setActiveModal('viscosities')
                              }}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                              title="Edit Viscosity Grade"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'viscosities',
                                  id: v.id,
                                  title: v.name,
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                              title="Delete Viscosity Grade"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={paginatedViscosities.page}
              totalPages={paginatedViscosities.totalPages}
              totalItems={paginatedViscosities.total}
              pageSize={paginatedViscosities.pageSize}
              onPageChange={(p) => updatePagination('viscosities', p)}
              onPageSizeChange={(s) => updatePagination('viscosities', 1, s)}
              itemName="viscosity grades"
            />
            </>
          )}

          {/* VIEW 4: PACKAGING TYPES TABLE */}
          {productSubTab === 'packaging' && (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Packaging Name</th>
                    <th className="py-3 px-4">System Code</th>
                    <th className="py-3 px-4">Default Capacity</th>
                    <th className="py-3 px-4">Unit of Measure (UOM)</th>
                    <th className="py-3 px-4">Associated Products</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedPackagingTypes.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                        No packaging types found. Click &quot;Configure Packaging Type&quot; to add one.
                      </td>
                    </tr>
                  ) : (
                    paginatedPackagingTypes.items.map((p) => {
                      const productCount = products.filter(
                        (prod) => prod.packaging === p.code || prod.packaging === p.name
                      ).length
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            {p.name}
                            {p.description && (
                              <div className="text-[10px] text-zinc-500 font-normal">{p.description}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              {p.code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {p.defaultLiters} Liters
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                            {p.uom}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                              {productCount} SKUs
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingItem(p)
                                setActiveModal('packaging')
                              }}
                              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                              title="Edit Packaging Type"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'packaging',
                                  id: p.id,
                                  title: p.name,
                                })
                              }
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                              title="Delete Packaging Type"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={paginatedPackagingTypes.page}
              totalPages={paginatedPackagingTypes.totalPages}
              totalItems={paginatedPackagingTypes.total}
              pageSize={paginatedPackagingTypes.pageSize}
              onPageChange={(p) => updatePagination('packagingTypes', p)}
              onPageSizeChange={(s) => updatePagination('packagingTypes', 1, s)}
              itemName="packaging types"
            />
            </>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: INVENTORY BATCHES CRUD TABLE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'batches' && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              <span>Inventory Batches & FIFO Cost Lots ({filteredBatches.length})</span>
            </h3>
            <button
              onClick={() => {
                setEditingItem(null)
                setActiveModal('batches')
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Inward Batch / Purchase</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-4">Supplier / Source</th>
                  <th className="py-3 px-4">Purchase Rate (FIFO)</th>
                  <th className="py-3 px-4">Trade Price (TP)</th>
                  <th className="py-3 px-4">MRP</th>
                  <th className="py-3 px-4">Stock Quantity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedBatches.items.map((b) => {
                  const supplierName =
                    suppliers.find((s) => s.id === b.supplierId)?.name || 'Direct / Principal'
                  return (
                    <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {b.batchNumber}
                        <div className="text-[10px] text-zinc-500 font-normal">{b.agency?.code || b.agencyId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {b.product?.name || b.productId}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500">{b.product?.sku}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">
                          {supplierName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {b.receivedDate ? `Received ${b.receivedDate}` : 'Inward Lot'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                        ৳{Number(b.purchaseRate).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{Number(b.tradePrice).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500">
                        ৳{Number(b.mrp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`font-black text-sm ${b.stockQuantity <= (b.minAlertStock || 5) ? 'text-red-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {b.stockQuantity}
                        </span>
                        <span className="text-zinc-500 text-[10px] ml-1">
                          {b.product?.uom === 'LITERS' ? 'Ltr' : 'Units'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingItem(b)
                            setActiveModal('batches')
                          }}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                          title="Edit Batch"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'batches',
                              id: b.id,
                              title: `Batch ${b.batchNumber}`,
                            })
                          }
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={paginatedBatches.page}
            totalPages={paginatedBatches.totalPages}
            totalItems={paginatedBatches.total}
            pageSize={paginatedBatches.pageSize}
            onPageChange={(p) => updatePagination('batches', p)}
            onPageSizeChange={(s) => updatePagination('batches', 1, s)}
            itemName="inventory batches"
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: CUSTOMERS CRUD TABLE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'customers' && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-500" />
              <span>Customer Khata Accounts & Credit Limits ({filteredCustomers.length})</span>
            </h3>
            <button
              onClick={() => {
                setEditingItem(null)
                setActiveModal('customers')
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Customer Account</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Customer / Workshop</th>
                  <th className="py-3 px-4">Proprietor / Phone</th>
                  <th className="py-3 px-4">Fleet / Focus</th>
                  <th className="py-3 px-4">Total Credit Limit</th>
                  <th className="py-3 px-4">Current Due</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedCustomers.items.map((cust) => (
                  <tr key={cust.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {cust.name}
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <div>{cust.proprietor || 'N/A'}</div>
                      <div className="font-mono text-zinc-500">{cust.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                        {cust.vehicleTypeFocus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      ৳{Number(cust.totalCreditLimit).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-red-600 dark:text-red-400">
                      ৳{Number(cust.currentDue).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-zinc-500 max-w-xs truncate">
                      {cust.address}, {cust.district}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingItem(cust)
                          setActiveModal('customers')
                        }}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: 'customers',
                            id: cust.id,
                            title: cust.name,
                          })
                        }
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={paginatedCustomers.page}
            totalPages={paginatedCustomers.totalPages}
            totalItems={paginatedCustomers.total}
            pageSize={paginatedCustomers.pageSize}
            onPageChange={(p) => updatePagination('customers', p)}
            onPageSizeChange={(s) => updatePagination('customers', 1, s)}
            itemName="customer accounts"
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 5: INVOICES CRUD & SUPER ADMIN VOID/RESTORE TABLE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'invoices' && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" />
                <span>Commercial Invoices & Chalans ({filteredInvoices.length})</span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Super Admin Void authority: voids invoice, automatically restores batch stock, and rolls back customer Khata dues.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Invoice # / Chalan</th>
                  <th className="py-3 px-4">Dealership Agency</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Super Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedInvoices.items.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {inv.invoiceNo}
                      <div className="text-[10px] text-zinc-500 font-normal">{inv.chalanNo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {inv.agency?.code || inv.agencyId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {inv.customer?.name || inv.customerId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ৳{Number(inv.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                      ৳{Number(inv.paidAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                      ৳{Number(inv.dueAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: 'invoices',
                            id: inv.id,
                            title: `Invoice ${inv.invoiceNo} (Due: ৳${inv.dueAmount.toLocaleString()})`,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold text-[11px] hover:bg-red-100 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Void & Rollback</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={paginatedInvoices.page}
            totalPages={paginatedInvoices.totalPages}
            totalItems={paginatedInvoices.total}
            pageSize={paginatedInvoices.pageSize}
            onPageChange={(p) => updatePagination('invoices', p)}
            onPageSizeChange={(s) => updatePagination('invoices', 1, s)}
            itemName="commercial invoices"
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 6: SUPPLIERS CRUD TABLE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'suppliers' && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-500" />
              <span>Brand Principal Suppliers ({filteredSuppliers.length})</span>
            </h3>
            <button
              onClick={() => {
                setEditingItem(null)
                setActiveModal('suppliers')
              }}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Configure Principal Supplier</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase tracking-wider text-[10px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Supplier Name / Code</th>
                  <th className="py-3 px-4">Dealership Agency</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Payable Balance</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedSuppliers.items.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {s.name}
                      <div className="text-[10px] font-mono text-zinc-500">{s.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      {s.agency?.code || s.agencyId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {s.contactPerson || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] font-mono text-zinc-500">
                      <div>{s.phone}</div>
                      <div>{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ৳{Number(s.currentBalance).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-zinc-500 max-w-xs truncate">
                      {s.address}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingItem({ supplierId: s.id, agencyId: s.agencyId })
                          setActiveModal('batches')
                        }}
                        className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 cursor-pointer"
                        title="Record Inward Purchase from this Supplier"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(s)
                          setActiveModal('suppliers')
                        }}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                        title="Edit Supplier"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirmation({
                            type: 'suppliers',
                            id: s.id,
                            title: s.name,
                          })
                        }
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
                        title="Delete Supplier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={paginatedSuppliers.page}
            totalPages={paginatedSuppliers.totalPages}
            totalItems={paginatedSuppliers.total}
            pageSize={paginatedSuppliers.pageSize}
            onPageChange={(p) => updatePagination('suppliers', p)}
            onPageSizeChange={(s) => updatePagination('suppliers', 1, s)}
            itemName="principal suppliers"
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 1: AGENCY FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'agencies' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-2xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Building2 className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Dealership Agency' : 'Register New Dealership Agency'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAgency} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Agency Name *</label>
                    <input
                      name="name"
                      required
                      defaultValue={editingItem?.name || ''}
                      placeholder="e.g. N Rahman Traders - Caltex Agency"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Code (Slug) *</label>
                    <input
                      name="code"
                      required
                      defaultValue={editingItem?.code || ''}
                      placeholder="e.g. CALTEX, SHELL, MOBIL, TOTAL"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 uppercase text-base sm:text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Principal Brand *</label>
                    <input
                      name="brandPrincipal"
                      required
                      defaultValue={editingItem?.brandPrincipal || ''}
                      placeholder="e.g. Chevron Bangladesh (Caltex)"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Trade License No *</label>
                    <input
                      name="tradeLicense"
                      required
                      defaultValue={editingItem?.tradeLicense || ''}
                      placeholder="TRAD/DSCC/019283/2022"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">BIN No (13-Digit) *</label>
                    <input
                      name="binNo"
                      required
                      defaultValue={editingItem?.binNo || ''}
                      placeholder="002349182-0101"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">TIN No</label>
                    <input
                      name="tinNo"
                      defaultValue={editingItem?.tinNo || ''}
                      placeholder="482910482910"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Official Phone *</label>
                    <input
                      name="phone"
                      required
                      defaultValue={editingItem?.phone || ''}
                      placeholder="+880 1711-234567"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Brand Color Hex</label>
                    <input
                      name="brandColor"
                      type="color"
                      defaultValue={editingItem?.brandColor || '#dc2626'}
                      className="w-full h-10 p-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Depot / Office Address *</label>
                  <input
                    name="address"
                    required
                    defaultValue={editingItem?.address || ''}
                    placeholder="Plot 14/A, Tejgaon Industrial Area, Dhaka-1208"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-500">
                    Authorized Bank Account Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <input
                      name="bankName"
                      defaultValue={editingItem?.bankName || ''}
                      placeholder="Bank Name (e.g. Islami Bank PLC)"
                      className="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base sm:text-sm"
                    />
                    <input
                      name="bankAccountNo"
                      defaultValue={editingItem?.bankAccountNo || ''}
                      placeholder="Account Number"
                      className="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-base sm:text-sm"
                    />
                    <input
                      name="bankBranch"
                      defaultValue={editingItem?.bankBranch || ''}
                      placeholder="Branch Name"
                      className="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-base sm:text-sm"
                    />
                    <input
                      name="bankRoutingNo"
                      defaultValue={editingItem?.bankRoutingNo || ''}
                      placeholder="Routing No (e.g. 125272891)"
                      className="p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-base sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Changes' : 'Register Dealership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 2: PRODUCT FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'products' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-2xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Boxes className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Product SKU' : 'Add New Product SKU'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Dealership Agency *</label>
                    <select
                      name="agencyId"
                      required
                      defaultValue={editingItem?.agencyId || agencies[0]?.id}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {agencies.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300">Brand Name *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null)
                          setActiveModal('brands')
                        }}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Brand</span>
                      </button>
                    </div>
                    <select
                      name="brand"
                      required
                      defaultValue={editingItem?.brand || brands[0]?.name || ''}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} {b.country ? `(${b.country})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Product Name *</label>
                    <input
                      name="name"
                      required
                      defaultValue={editingItem?.name || ''}
                      placeholder="e.g. Delo 400 MGX SAE 15W-40 (Heavy Commercial)"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Product SKU *</label>
                    <input
                      name="sku"
                      required
                      defaultValue={editingItem?.sku || ''}
                      placeholder="e.g. DELO-400-4L"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 uppercase font-mono text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300">Viscosity Grade *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null)
                          setActiveModal('viscosities')
                        }}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Grade</span>
                      </button>
                    </div>
                    <select
                      name="viscosityGrade"
                      required
                      defaultValue={editingItem?.viscosityGrade || viscosities[0]?.code || ''}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {viscosities.map((v) => (
                        <option key={v.id} value={v.code}>
                          {v.name} ({v.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300">Packaging Type *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null)
                          setActiveModal('packaging')
                        }}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Packaging</span>
                      </button>
                    </div>
                    <select
                      name="packaging"
                      required
                      value={productFormPackaging}
                      onChange={(e) => {
                        const code = e.target.value
                        setProductFormPackaging(code)
                        const found = packagingTypes.find((p) => p.code === code)
                        if (found) {
                          setProductFormLiters(found.defaultLiters)
                          setProductFormUom(found.uom)
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {packagingTypes.map((p) => (
                        <option key={p.id} value={p.code}>
                          {p.name} ({p.defaultLiters}L • {p.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Liters per Unit *</label>
                    <input
                      name="litersPerUnit"
                      type="number"
                      step="0.1"
                      required
                      value={productFormLiters}
                      onChange={(e) => setProductFormLiters(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Unit of Measure (UOM)</label>
                    <select
                      name="uom"
                      value={productFormUom}
                      onChange={(e) => setProductFormUom(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      <option value="PIECES">PIECES (Pcs)</option>
                      <option value="LITERS">LITERS (Ltr)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Min Alert Stock Threshold</label>
                    <input
                      name="minAlertStock"
                      type="number"
                      defaultValue={editingItem?.minAlertStock || 5}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save SKU' : 'Create Product SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 3: INVENTORY BATCH FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'batches' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Layers className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Inventory Batch Lot' : 'Record Supplier Purchase & Inward Batch'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBatch} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                {/* Guidance Banner */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">Inward Supplier Purchase Lot:</span>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                      Recording this batch registers stock in warehouse inventory, updates supplier payables, and immediately takes effect in the commercial <strong>BUY (Procurement & Lifting)</strong> analytics.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Dealership Agency *</label>
                    <select
                      name="agencyId"
                      required
                      defaultValue={editingItem?.agencyId || agencies[0]?.id}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {agencies.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} ({a.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300">Principal Supplier</label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(null)
                          setActiveModal('suppliers')
                        }}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        + Add Supplier
                      </button>
                    </div>
                    <select
                      name="supplierId"
                      defaultValue={editingItem?.supplierId || suppliers[0]?.id || ''}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      <option value="">Direct / Principal Delivery</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code || 'Supplier'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Target Product *</label>
                    <select
                      name="productId"
                      required
                      defaultValue={editingItem?.productId || products[0]?.id}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku} • {p.brand})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Batch Lot Number *</label>
                    <input
                      name="batchNumber"
                      required
                      defaultValue={editingItem?.batchNumber || ''}
                      placeholder="e.g. CTX-2026-B04"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 uppercase font-mono text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Inward Purchase Date *</label>
                    <input
                      name="receivedDate"
                      type="date"
                      required
                      defaultValue={editingItem?.receivedDate || new Date().toISOString().slice(0, 10)}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Purchase Rate (FIFO Cost) ৳ *</label>
                    <input
                      name="purchaseRate"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingItem?.purchaseRate || 0}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Trade Price (TP Wholesale) ৳ *</label>
                    <input
                      name="tradePrice"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingItem?.tradePrice || 0}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Maximum Retail Price (MRP) ৳ *</label>
                    <input
                      name="mrp"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingItem?.mrp || 0}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Received Stock Quantity *</label>
                    <input
                      name="stockQuantity"
                      type="number"
                      step="0.1"
                      required
                      defaultValue={editingItem?.stockQuantity || 10}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono font-bold text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">PO / Delivery Challan Ref #</label>
                    <input
                      name="poNumber"
                      defaultValue={editingItem?.poNumber || ''}
                      placeholder="e.g. PO-88312 / Challan-5501 (auto if blank)"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Batch & Rates' : 'Record Inward Purchase & Lot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 4: CUSTOMER FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'customers' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Users className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Customer & Credit Limit' : 'Register New Fleet / Workshop Customer'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCustomer} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Customer / Business Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingItem?.name || ''}
                    placeholder="e.g. M/S Hanif Enterprise (Bus Workshop)"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Proprietor / Contact Name</label>
                    <input
                      name="proprietor"
                      defaultValue={editingItem?.proprietor || ''}
                      placeholder="Hazi Bilal Hossain"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Primary Phone *</label>
                    <input
                      name="phone"
                      required
                      defaultValue={editingItem?.phone || ''}
                      placeholder="01711-554433"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Vehicle / Segment Focus</label>
                    <select
                      name="vehicleTypeFocus"
                      defaultValue={editingItem?.vehicleTypeFocus || 'BUS_FLEET'}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {Object.values(VehicleTypeFocus).map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Total Credit Limit (৳) *</label>
                    <input
                      name="totalCreditLimit"
                      type="number"
                      step="1000"
                      required
                      defaultValue={editingItem?.totalCreditLimit || 500000}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono font-bold text-base sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Depot / Workshop Address *</label>
                  <input
                    name="address"
                    required
                    defaultValue={editingItem?.address || ''}
                    placeholder="Gabtoli Central Bus Stand, Dhaka"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Customer' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 5: SUPPLIER FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'suppliers' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Truck className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Principal Supplier' : 'Add Principal Supplier'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSupplier} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Dealership Agency *</label>
                    <select
                      name="agencyId"
                      required
                      defaultValue={editingItem?.agencyId || agencies[0]?.id}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm font-medium"
                    >
                      {agencies.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} ({a.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Supplier Code *</label>
                    <input
                      name="code"
                      required
                      defaultValue={editingItem?.code || ''}
                      placeholder="CHEVRON-BD, SHELL-BD"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 uppercase font-mono text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Principal Organization Name *</label>
                    <input
                      name="name"
                      required
                      defaultValue={editingItem?.name || ''}
                      placeholder="Chevron Bangladesh Block (Caltex Principal)"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Contact Officer</label>
                    <input
                      name="contactPerson"
                      defaultValue={editingItem?.contactPerson || ''}
                      placeholder="Key Accounts Director"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Phone *</label>
                    <input
                      name="phone"
                      required
                      defaultValue={editingItem?.phone || ''}
                      placeholder="+880 2-8833441"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Office Address *</label>
                  <input
                    name="address"
                    required
                    defaultValue={editingItem?.address || ''}
                    placeholder="Chevron Tower, Gulshan-2, Dhaka"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Supplier' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 7: BRAND FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'brands' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Award className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Brand Profile' : 'Register New Lubricant Brand'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBrand} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Brand Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingItem?.name || ''}
                    placeholder="e.g. Chevron, Mobil, Castrol, Total"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Country / Origin</label>
                  <input
                    name="country"
                    defaultValue={editingItem?.country || ''}
                    placeholder="e.g. USA, UK, France, Germany, Japan"
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description / Principal Details</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingItem?.description || ''}
                    placeholder="Principal manufacturer, brand lineage, and authorization notes..."
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Brand' : 'Register Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 8: VISCOSITY GRADE FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'viscosities' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Gauge className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Viscosity Grade' : 'Register Viscosity Grade'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveViscosity} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Grade Label / Name *</label>
                    <input
                      name="name"
                      required
                      defaultValue={editingItem?.name || ''}
                      placeholder="e.g. 15W-40, 20W-50, ISO VG 68"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">System Code</label>
                    <input
                      name="code"
                      defaultValue={editingItem?.code || ''}
                      placeholder="Auto-generated if blank (e.g. SAE_15W_40)"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description / Industry Standard</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingItem?.description || ''}
                    placeholder="Standard SAE / ISO viscosity classification, heavy duty engine oil, transmission or hydraulic use..."
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Grade' : 'Register Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 9: PACKAGING TYPE FORM MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeModal === 'packaging' && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                <Package className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="truncate">{editingItem ? 'Edit Packaging Type' : 'Configure Packaging Type'}</span>
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePackaging} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Packaging Name *</label>
                    <input
                      name="name"
                      required
                      defaultValue={editingItem?.name || ''}
                      placeholder="e.g. 4L Canister, 208L Steel Drum"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">System Code</label>
                    <input
                      name="code"
                      defaultValue={editingItem?.code || ''}
                      placeholder="Auto-generated if blank (e.g. CAN_4L)"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Default Capacity (Liters) *</label>
                    <input
                      name="defaultLiters"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={editingItem?.defaultLiters ?? 4.0}
                      placeholder="4.0"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Unit of Measure (UOM)</label>
                    <select
                      name="uom"
                      defaultValue={editingItem?.uom || 'PIECES'}
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                    >
                      <option value="PIECES">PIECES</option>
                      <option value="DRUMS">DRUMS</option>
                      <option value="LITERS">LITERS</option>
                      <option value="CARTONS">CARTONS</option>
                      <option value="PAILS">PAILS</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description / Specifications</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingItem?.description || ''}
                    placeholder="Physical container type, material (HDPE, steel drum), decantable characteristics..."
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isPending ? 'Saving...' : editingItem ? 'Save Packaging' : 'Register Packaging'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CONFIRMATION DIALOG (DELETE / VOID) */}
      {/* --------------------------------------------------------------------- */}
      {deleteConfirmation && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmation(null)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-red-200 dark:border-red-900 shadow-2xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto -mt-1 mb-2 sm:hidden shrink-0" />

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {deleteConfirmation.type === 'invoices'
                  ? 'Confirm Super Admin Invoice Void'
                  : `Delete ${
                      {
                        agencies: 'Agency',
                        products: 'Product SKU',
                        batches: 'Batch',
                        customers: 'Customer Profile',
                        suppliers: 'Supplier',
                        brands: 'Brand',
                        viscosities: 'Viscosity Grade',
                        packaging: 'Packaging Type',
                      }[deleteConfirmation.type] || 'Record'
                    }?`}
              </h3>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {deleteConfirmation.type === 'invoices' ? (
                  <span>
                    You are voiding <strong>{deleteConfirmation.title}</strong>. This will automatically restore batch stock quantities back to inventory and roll back customer Khata receivables.
                  </span>
                ) : (
                  <span>
                    Are you sure you want to permanently remove <strong>{deleteConfirmation.title}</strong>? This action will affect linked records.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm font-semibold cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer disabled:opacity-50 text-center"
              >
                {isPending ? 'Processing...' : deleteConfirmation.type === 'invoices' ? 'Void & Restore Stock' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
