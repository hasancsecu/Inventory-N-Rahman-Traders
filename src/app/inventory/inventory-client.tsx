'use client'

import * as React from 'react'
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  FileText,
  ShieldCheck,
  TrendingUp,
  Crown,
  ShoppingCart,
  Truck,
  Calendar,
  DollarSign,
  Layers,
  X,
  Building2,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AgencySummary } from '@/actions/agency'
import { AuthUser } from '@/lib/auth-types'
import { createMasterBatch, getPaginatedInventoryAction } from '@/actions/master-data'
import { Pagination } from '@/components/ui/pagination'
import { cleanNumericString, handleNumericFocus } from '@/components/ui/number-input'
import { useLanguage } from '@/context/language-context'
import { toast } from '@/components/ui/toast'

interface InventoryClientProps {
  currentAgency: AgencySummary | null
  agencies: AgencySummary[]
  products: any[]
  suppliers?: any[]
  currentUser?: AuthUser
}

export function InventoryClient({
  currentAgency,
  agencies,
  products,
  suppliers = [],
  currentUser,
}: InventoryClientProps) {
  const router = useRouter()
  const { t, language, formatCurrency, formatNumber } = useLanguage()
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'
  const isManager = currentUser?.role === 'AGENCY_MANAGER' || isSuperAdmin
  const canInward = isManager || currentUser?.role === 'STOREKEEPER'

  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedSegment, setSelectedSegment] = React.useState('ALL')

  // Purchase / Batch Inward Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Inward Purchase Form Fields
  const [selectedSupplierId, setSelectedSupplierId] = React.useState('')
  const [selectedProductId, setSelectedProductId] = React.useState('')
  const [batchNumber, setBatchNumber] = React.useState('')
  const [purchaseRate, setPurchaseRate] = React.useState('')
  const [tradePrice, setTradePrice] = React.useState('')
  const [mrp, setMrp] = React.useState('')
  const [stockQuantity, setStockQuantity] = React.useState('')
  const [minAlertStock, setMinAlertStock] = React.useState('5')
  const [receivedDate, setReceivedDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  )
  const [poNumber, setPoNumber] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4500)
  }

  const resetForm = () => {
    setSelectedSupplierId('')
    setSelectedProductId('')
    setBatchNumber('')
    setPurchaseRate('')
    setTradePrice('')
    setMrp('')
    setStockQuantity('')
    setMinAlertStock('5')
    setReceivedDate(new Date().toISOString().slice(0, 10))
    setPoNumber('')
    setNotes('')
  }

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId)
    const prod = products.find((p) => p.id === prodId)
    if (prod && prod.batches && prod.batches.length > 0) {
      const latestBatch = prod.batches[0]
      if (latestBatch.purchaseRate && !purchaseRate) {
        setPurchaseRate(String(latestBatch.purchaseRate))
      }
      if (latestBatch.tradePrice && !tradePrice) {
        setTradePrice(String(latestBatch.tradePrice))
      }
      if (latestBatch.mrp && !mrp) {
        setMrp(String(latestBatch.mrp))
      }
    }
  }

  const openInwardModalForProduct = (prodId: string) => {
    handleProductSelect(prodId)
    setIsPurchaseModalOpen(true)
  }

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId) {
      toast.warning(language === 'bn' ? 'অনুগ্রহ করে পণ্যের এসকেইউ (SKU) নির্বাচন করুন।' : 'Please select a product SKU')
      return
    }
    if (!batchNumber.trim()) {
      toast.warning(language === 'bn' ? 'অনুগ্রহ করে ব্যাচ লট নম্বর দিন।' : 'Please enter a batch lot number')
      return
    }
    if (!purchaseRate || Number(purchaseRate) <= 0) {
      toast.warning(language === 'bn' ? 'সঠিক ক্রয়মূল্য (FIFO cost) প্রদান করুন।' : 'Please enter a valid purchase rate (FIFO cost)')
      return
    }
    if (!tradePrice || Number(tradePrice) <= 0) {
      toast.warning(language === 'bn' ? 'সঠিক ট্রেড প্রাইজ (TP) প্রদান করুন।' : 'Please enter a valid trade price (TP)')
      return
    }
    if (!stockQuantity || Number(stockQuantity) <= 0) {
      toast.warning(language === 'bn' ? 'মজুত পরিমাণ ০-এর বেশি হতে হবে।' : 'Please enter a stock quantity greater than 0')
      return
    }

    const agencyId = currentAgency?.id || agencies[0]?.id
    if (!agencyId) {
      toast.error(language === 'bn' ? 'কোনো সক্রিয় ডিলারশিপ এজেন্সি নির্বাচিত নেই।' : 'No active dealership agency selected')
      return
    }

    startTransition(async () => {
      try {
        const res = await createMasterBatch({
          agencyId,
          productId: selectedProductId,
          batchNumber: batchNumber.trim().toUpperCase(),
          supplierId: selectedSupplierId || undefined,
          purchaseRate: Number(purchaseRate),
          tradePrice: Number(tradePrice),
          mrp: mrp ? Number(mrp) : Number(tradePrice) * 1.08,
          stockQuantity: Number(stockQuantity),
          minAlertStock: Number(minAlertStock) || 5,
          receivedDate,
          poNumber: poNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        })

        if (res.success) {
          const prod = products.find((p) => p.id === selectedProductId)
          const totalVal = (
            Number(stockQuantity) * Number(purchaseRate)
          ).toLocaleString()
          showToast(
            `Inward purchase recorded: ${prod?.name || 'Item'} (Lot: ${batchNumber.toUpperCase()}). ৳${totalVal} synced to Stock, Supplier Khata & Buy Analytics.`
          )
          toast.success(
            language === 'bn'
              ? `ক্রয় চালান সম্পন্ন: ${prod?.name || 'পণ্য'} (লট: ${batchNumber.toUpperCase()})`
              : `Inward purchase recorded: ${prod?.name || 'Item'}`
          )
          setIsPurchaseModalOpen(false)
          resetForm()
          router.refresh()
        } else {
          toast.error((res as any).error || (language === 'bn' ? 'ক্রয় চালান সংরক্ষণ করা যায়নি।' : 'Failed to record inward purchase'))
        }
      } catch (err: any) {
        toast.error(err?.message || (language === 'bn' ? 'ক্রয় চালান সংরক্ষণ করা যায়নি।' : 'Failed to record inward purchase'))
      }
    })
  }

  // Backend Pagination State
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [isPageLoading, setIsPageLoading] = React.useState(false)
  const [paginatedData, setPaginatedData] = React.useState<{
    items: any[]
    total: number
    totalPages: number
  }>(() => {
    const initialFiltered = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.viscosityGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSegment =
        selectedSegment === 'ALL' || p.applicationSegment === selectedSegment
      return matchesSearch && matchesSegment
    })
    return {
      items: initialFiltered.slice(0, 10),
      total: initialFiltered.length,
      totalPages: Math.max(1, Math.ceil(initialFiltered.length / 10)),
    }
  })

  // Debounced backend pagination fetch
  React.useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setIsPageLoading(true)
      try {
        const res = await getPaginatedInventoryAction({
          agencyId: currentAgency?.id,
          page,
          pageSize,
          search: searchQuery,
          segment: selectedSegment,
        })
        if (active && res.success && res.data) {
          setPaginatedData({
            items: res.data.items,
            total: res.data.total,
            totalPages: res.data.totalPages,
          })
        }
      } catch (err) {
        console.error('Failed to fetch paginated inventory', err)
      } finally {
        if (active) setIsPageLoading(false)
      }
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [currentAgency?.id, page, pageSize, searchQuery, selectedSegment, products])

  // Aggregate stats
  const totalStockValue = products.reduce((total, p) => {
    return (
      total +
      (p.batches || []).reduce(
        (sum: number, b: any) => sum + b.stockQuantity * b.purchaseRate,
        0
      )
    )
  }, 0)

  const totalVolumeInDepot = products.reduce((total, p) => {
    return (
      total +
      (p.batches || []).reduce(
        (sum: number, b: any) => sum + b.stockQuantity * (p.litersPerUnit || 1),
        0
      )
    )
  }, 0)

  const lowStockCount = products.reduce((sum, p) => {
    return (
      sum +
      (p.batches || []).filter(
        (b: any) => b.stockQuantity <= (b.minAlertStock || 5)
      ).length
    )
  }, 0)

  const selectedProdObj = products.find((p) => p.id === selectedProductId)
  const calcTotalAmount =
    (Number(stockQuantity) || 0) * (Number(purchaseRate) || 0)
  const calcTotalLiters =
    (Number(stockQuantity) || 0) * (selectedProdObj?.litersPerUnit || 1)

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-zinc-950 text-white border border-emerald-500/40 px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs font-medium leading-relaxed">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
              <Boxes className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t.inventory.title}
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {language === 'bn' ? 'ডিলারশিপ পরিসীমা:' : 'Scoped to'}{' '}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {currentAgency?.name || (language === 'bn' ? 'সকল ডিলারশিপ' : 'All Dealerships')}
            </span>{' '}
            • {t.inventory.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canInward && (
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Truck className="h-4 w-4" />
              <span>{language === 'bn' ? 'নতুন চালান ক্রয় / ব্যাচ এন্ট্রি' : 'Inward Purchase / Add Batch'}</span>
            </button>
          )}

          {isSuperAdmin && (
            <Link
              href="/admin/master-data"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Crown className="h-4 w-4" />
              <span>{t.nav.masterData}</span>
            </Link>
          )}

          <Link
            href="/pos"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{t.nav.pos}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {language === 'bn' ? 'মোট ইনভেন্টরি মূল্যায়ন (ফিফো দর)' : 'Total Inventory Valuation (FIFO Cost)'}
          </span>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {formatCurrency(totalStockValue)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            {formatNumber(products.length)} {language === 'bn' ? 'টি পণ্য ক্যাটালগ' : 'catalog items'} ({currentAgency?.code || (language === 'bn' ? 'সকল' : 'All')})
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t.dashboard.kpiTotalLiters}
          </span>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {formatNumber(Math.round(totalVolumeInDepot))} Liters
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {language === 'bn' ? 'গুদামের সকল বাণিজ্যিক প্যাকেজিংয়ের মোট ভলিউম' : 'All warehouse inventory & commercial packaging'}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t.dashboard.lowStockAlert}
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {formatNumber(lowStockCount)} {language === 'bn' ? 'টি ব্যাচ' : 'Batches'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {language === 'bn' ? 'পুনঃঅর্ডার সীমার নিচে থাকা ব্যাচ' : 'Batches at or below reorder threshold'}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t.inventory.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={selectedSegment}
            onChange={(e) => {
              setSelectedSegment(e.target.value)
              setPage(1)
            }}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            <option value="ALL">{language === 'bn' ? 'সকল অ্যাপ্লিকেশন সেগমেন্ট' : 'All Application Segments'}</option>
            <option value="HEAVY_COMMERCIAL">{language === 'bn' ? 'হেভি কমার্শিয়াল (বাস/ট্রাক)' : 'Heavy Commercial (Bus/Truck)'}</option>
            <option value="PASSENGER_CAR">{language === 'bn' ? 'প্যাসেঞ্জার কার ও বাইক' : 'Passenger Car'}</option>
            <option value="INDUSTRIAL">{language === 'bn' ? 'শিল্প ও হাইড্রোলিক' : 'Industrial & Hydraulic'}</option>
          </select>
        </div>
      </div>

      {/* Products & Batches Table (Desktop View) */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">{t.inventory.colProduct}</th>
                <th className="py-3 px-4">{t.inventory.colGrade}</th>
                <th className="py-3 px-4">{t.inventory.colPackaging}</th>
                <th className="py-3 px-4">{t.inventory.colBatches}</th>
                <th className="py-3 px-4 text-right">{t.inventory.colStock}</th>
                <th className="py-3 px-4 text-right">{t.inventory.colCost}</th>
                <th className="py-3 px-4 text-right">{t.inventory.colSellingPrice}</th>
                <th className="py-3 px-4 text-center">{t.common.status} / {t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
              {paginatedData.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      No products or batches found for this dealership.
                    </p>
                    {canInward && (
                      <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Inward First Purchase Lot</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.items.flatMap((p) => {
                  const batchList = p.batches || []

                  if (batchList.length === 0) {
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                            SKU: {p.sku} • {p.brand}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          {p.viscosityGrade.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                            {p.packaging?.replace('_', ' ') || 'STANDARD'} (
                            {p.litersPerUnit || 1}L)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 italic">
                          No inward batches recorded
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold font-mono text-zinc-400 text-sm">
                            0 {p.uom === 'LITERS' ? 'Ltr' : 'Pcs'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                          -
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                          -
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {canInward ? (
                            <button
                              onClick={() => openInwardModalForProduct(p.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Inward Batch</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-100 text-zinc-500">
                              Out of Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  }

                  return batchList.map((batch: any, bIdx: number) => {
                    const isLow =
                      batch.stockQuantity <= (batch.minAlertStock || 5)

                    return (
                      <tr
                        key={`${p.id}-${batch.id || bIdx}`}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                            SKU: {p.sku} • {p.brand}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          {p.viscosityGrade.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono">
                            {p.packaging?.replace('_', ' ') || 'STANDARD'} (
                            {p.litersPerUnit || 1}L)
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {batch.batchNumber || 'N/A'}
                          </div>
                          {batch.receivedDate && (
                            <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                              Inward: {batch.receivedDate}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold font-mono text-zinc-900 dark:text-zinc-100 text-sm">
                            {batch.stockQuantity || 0}{' '}
                            {p.uom === 'LITERS' ? 'Ltr' : 'Pcs'}
                          </div>
                          {isLow && (
                            <div className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              <AlertTriangle className="h-3 w-3" /> Reorder Alert
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-600 dark:text-zinc-400">
                          ৳
                          {batch.purchaseRate
                            ? batch.purchaseRate.toLocaleString()
                            : 0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ৳
                          {batch.tradePrice
                            ? batch.tradePrice.toLocaleString()
                            : 0}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {batch.stockQuantity > (batch.minAlertStock || 5) ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                In Stock
                              </span>
                            ) : batch.stockQuantity > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-700 dark:text-red-400">
                                Out of Stock
                              </span>
                            )}
                            {canInward && (
                              <button
                                onClick={() => openInwardModalForProduct(p.id)}
                                title="Inward more stock for this product"
                                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-emerald-600 transition-colors cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Product & Stock Cards */}
        <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
          {paginatedData.items.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {language === 'bn' ? 'কোনো পণ্য বা মজুত পাওয়া যায়নি।' : 'No products or batches found for this dealership.'}
              </p>
              {canInward && (
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer touch-manipulation active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>{language === 'bn' ? 'প্রথম চালান ইনওয়ার্ড করুন' : 'Inward First Purchase Lot'}</span>
                </button>
              )}
            </div>
          ) : (
            paginatedData.items.map((p) => {
              const batchList = p.batches || []
              const totalProdStock = batchList.reduce((acc: number, b: any) => acc + (b.stockQuantity || 0), 0)
              const hasBatches = batchList.length > 0

              return (
                <div key={p.id} className="p-4 space-y-3 bg-white dark:bg-zinc-900">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {p.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        SKU: {p.sku} • {p.brand}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono font-bold text-sm ${totalProdStock > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500'}`}>
                        {formatNumber(totalProdStock)} {p.uom === 'LITERS' ? (language === 'bn' ? 'লিটার' : 'Ltr') : (language === 'bn' ? 'পিস' : 'Pcs')}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {language === 'bn' ? 'মোট মজুত' : 'Total stock'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      {p.viscosityGrade.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                      {p.packaging?.replace('_', ' ') || 'STANDARD'} ({p.litersPerUnit || 1}L)
                    </span>
                    {canInward && (
                      <button
                        type="button"
                        onClick={() => openInwardModalForProduct(p.id)}
                        className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] cursor-pointer touch-manipulation active:scale-95"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{language === 'bn' ? 'ইনওয়ার্ড' : 'Inward'}</span>
                      </button>
                    )}
                  </div>

                  {/* Batch Details Accordion / List */}
                  {hasBatches ? (
                    <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {language === 'bn' ? 'সক্রিয় ব্যাচ লট সমূহ:' : 'Active Stock Batches:'}
                      </div>
                      <div className="space-y-1.5">
                        {batchList.map((batch: any, bIdx: number) => {
                          const isLow = batch.stockQuantity <= (batch.minAlertStock || 5)
                          const isOut = batch.stockQuantity <= 0
                          return (
                            <div
                              key={batch.id || bIdx}
                              className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-xs flex items-center justify-between gap-2"
                            >
                              <div>
                                <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                  {batch.batchNumber}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                  {language === 'bn' ? 'দর:' : 'TP:'} ৳{Number(batch.tradePrice || 0).toLocaleString()} • {language === 'bn' ? 'ক্রয়:' : 'Cost:'} ৳{Number(batch.purchaseRate || 0).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-mono font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {batch.stockQuantity} {p.uom === 'LITERS' ? 'L' : 'Pcs'}
                                </div>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                    isOut
                                      ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                                      : isLow
                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                  }`}
                                >
                                  {isOut ? (language === 'bn' ? 'স্টক শেষ' : 'Out') : isLow ? (language === 'bn' ? 'স্বল্প স্টক' : 'Low') : (language === 'bn' ? 'পর্যাপ্ত' : 'In Stock')}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      {language === 'bn' ? 'কোনো সক্রিয় ইনওয়ার্ড ব্যাচ নেই।' : 'No inward batches recorded.'}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Backend Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={paginatedData.totalPages}
          totalItems={paginatedData.total}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
          isLoading={isPageLoading}
          itemName="lubricant products"
        />
      </div>

      {/* Inward Purchase & Batch Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    Inward Stock Purchase from Supplier
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Record supplier purchase & batch arrival. Automatically
                    updates stock, supplier Khata & BUY analytics.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handlePurchaseSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                {/* Commercial Sync Callout */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-200">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Real-time Commercial ERP Linkage</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Entering an inward purchase here updates <strong>Inventory Depot Stock</strong>, logs an inward purchase order in <strong>BUY Analytics (Daily / Monthly / Yearly)</strong>, and credits the supplier&apos;s payable <strong>Khata ledger</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Supplier Selection */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Supplier / Principal Source *
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">
                        Direct Purchase / Cash Procurement (No Khata)
                      </option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) - {s.companyName || 'Supplier'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product SKU Selection */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Product SKU *
                    </label>
                    <select
                      required
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Select Product Catalog SKU --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.sku}] {p.name} - {p.brand} ({p.viscosityGrade},{' '}
                          {p.litersPerUnit || 1}L)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Batch Lot Number */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Batch / Lot Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BATCH-2026-05"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 uppercase focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Inward Date */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Inward Purchase Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={receivedDate}
                      onChange={(e) => setReceivedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Stock Quantity Received (Units/Cans/Drums) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 50"
                      value={stockQuantity}
                      onFocus={handleNumericFocus}
                      onChange={(e) => {
                        const cleaned = cleanNumericString(e.target.value)
                        e.target.value = cleaned
                        setStockQuantity(cleaned)
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Purchase Rate (FIFO Cost) */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Purchase Cost Rate (৳ / Unit) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      placeholder="e.g. 850"
                      value={purchaseRate}
                      onFocus={handleNumericFocus}
                      onChange={(e) => {
                        const cleaned = cleanNumericString(e.target.value)
                        e.target.value = cleaned
                        setPurchaseRate(cleaned)
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Trade Price (TP) */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Trade Price - TP (৳ / Unit) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      placeholder="e.g. 1000"
                      value={tradePrice}
                      onFocus={handleNumericFocus}
                      onChange={(e) => {
                        const cleaned = cleanNumericString(e.target.value)
                        e.target.value = cleaned
                        setTradePrice(cleaned)
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* MRP */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Maximum Retail Price - MRP (৳ / Unit)
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="e.g. 1100"
                      value={mrp}
                      onFocus={handleNumericFocus}
                      onChange={(e) => {
                        const cleaned = cleanNumericString(e.target.value)
                        e.target.value = cleaned
                        setMrp(cleaned)
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* PO Reference */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      PO / Challan Reference #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PO-SUP-2026-001"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Reorder Alert Stock */}
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Reorder Alert Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={minAlertStock}
                      onFocus={handleNumericFocus}
                      onChange={(e) => {
                        const cleaned = cleanNumericString(e.target.value)
                        e.target.value = cleaned
                        setMinAlertStock(cleaned)
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Purchase Notes / Vehicle Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Received via delivery truck #DHK-11-2034"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Calculation Summary Footer */}
                {calcTotalAmount > 0 && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Total Purchase Value (Cost)
                      </span>
                      <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                        ৳{calcTotalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Total Physical Volume
                      </span>
                      <div className="text-base font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                        {calcTotalLiters.toFixed(1)} Liters
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Recording Inward Purchase...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirm & Record Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
