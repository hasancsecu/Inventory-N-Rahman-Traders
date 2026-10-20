'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Droplet,
  ShoppingCart,
  Boxes,
  BookOpenCheck,
  Building2,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Fuel,
  Truck,
  CheckCircle2,
  Sparkles,
  Crown,
  Database,
  Shield,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { AgencySummary } from '@/actions/agency';
import { AuthUser } from '@/lib/auth-types';

interface DashboardClientProps {
  currentUser: AuthUser;
  currentAgency: AgencySummary | null;
  agencies: AgencySummary[];
  analytics: any;
  recentInvoices: any[];
  totalStockUnits: number;
  totalBatchesCount: number;
  lowStockBatches: any[];
}

export function DashboardClient({
  currentUser,
  currentAgency,
  agencies,
  analytics,
  recentInvoices,
  totalStockUnits,
  totalBatchesCount,
  lowStockBatches,
}: DashboardClientProps) {
  const { t, language, formatCurrency, formatNumber } = useLanguage();

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isStorekeeper = currentUser.role === 'STOREKEEPER';
  const isCashier = currentUser.role === 'CASHIER';
  const isManager = currentUser.role === 'AGENCY_MANAGER';

  const localizedRole = t.roles[currentUser.role as keyof typeof t.roles] || currentUser.role;

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Zero Seed Notification */}
      {agencies.length === 0 && (
        <div className="p-6 rounded-3xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                {t.dashboard.zeroSeedTitle}
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {t.dashboard.zeroSeedDesc}
              </p>
            </div>
          </div>
          <Link
            href="/admin/master-data"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs whitespace-nowrap shadow-sm transition-all"
          >
            {t.dashboard.openMasterData}
          </Link>
        </div>
      )}

      {/* Dealership Banner / Tenancy Scope */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-5 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                {t.dashboard.activeTenancy} {currentAgency?.code || (language === 'bn' ? 'সকল ডিলারশিপ' : 'MULTI-AGENCY')}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {isSuperAdmin ? (
                  <Crown className="w-3 h-3 text-amber-500" />
                ) : (
                  <Shield className="w-3 h-3 text-emerald-500" />
                )}
                <span>{t.dashboard.roleLabel} {localizedRole}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {currentAgency?.name ||
                (agencies.length === 0
                  ? language === 'bn'
                    ? 'এন্টারপ্রাইজ লুব্রিকেন্ট পরিবেশক'
                    : 'Enterprise Lubricant Distributorship'
                  : language === 'bn'
                  ? 'সকল ডিলারশিপের একত্রিত ড্যাশবোর্ড'
                  : 'Multi-Agency Consolidated View')}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
              {currentAgency ? (
                <>
                  {t.dashboard.authorizedDistributor}{' '}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {currentAgency.brandPrincipal}
                  </span>
                  . {t.dashboard.distributorDesc}
                </>
              ) : (
                t.dashboard.consolidatedDesc
              )}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <span>
                {t.dashboard.bin}{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {currentAgency?.binNo || '182947192-0101'}
                </strong>
              </span>
              <span>•</span>
              <span>
                {t.dashboard.tradeLicense}{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {currentAgency?.tradeLicense || 'TRAD/DNCC/029102/2024'}
                </strong>
              </span>
              <span>•</span>
              <span>
                {t.dashboard.district}{' '}
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {currentAgency?.district || (language === 'bn' ? 'ঢাকা' : 'Dhaka')}
                </strong>
              </span>
            </div>
          </div>

          {/* Dynamic Actions based on Role */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isSuperAdmin && (
              <Link
                href="/admin/master-data"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Crown className="h-4 w-4" />
                <span>{t.nav.masterData}</span>
              </Link>
            )}

            {/* POS billing */}
            {(isSuperAdmin || isManager || isCashier) && (
              <Link
                href="/pos"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm shadow-red-600/30 transition-all hover:scale-102 cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                {t.dashboard.newInvoiceBtn}
              </Link>
            )}

            {/* Inventory / Stock */}
            {(isSuperAdmin || isManager || isStorekeeper) && (
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 shadow-xs transition-all cursor-pointer"
              >
                <Boxes className="h-4 w-4 text-zinc-500" />
                {t.dashboard.inventoryBtn}
              </Link>
            )}

            {/* Khata / Dues */}
            {(isSuperAdmin || isManager || isCashier) && (
              <Link
                href="/khata"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 shadow-xs transition-all cursor-pointer"
              >
                <BookOpenCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {t.dashboard.khataBtn}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Dealership Revenue */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.dashboard.kpiTodaySales}
            </span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatCurrency(analytics.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {formatNumber(analytics.totalInvoicesCount)}{' '}
              {language === 'bn' ? 'টি চালান প্রদান' : 'invoices issued'}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {formatNumber(analytics.totalVolumeLiters)}{' '}
              {language === 'bn' ? 'লিটার বিক্রি' : 'Liters Sold'}
            </span>
          </div>
        </div>

        {/* Total Purchases (BUY) */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'bn' ? 'প্রিন্সিপাল হতে লিফটিং (BUY)' : 'Stock Inward (BUY)'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatCurrency(analytics.totalPurchasesAmount)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {formatNumber(analytics.totalPurchasesLiters)}{' '}
              {language === 'bn' ? 'লিটার উত্তোলন' : 'Liters lifted'}
            </span>
            <Link
              href="/analytics"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5"
            >
              {language === 'bn' ? 'অ্যানালিটিক্স' : 'Buy Analytics'} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* FIFO Gross Profit */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {language === 'bn' ? 'ফিফো মোট মুনাফা (Gross Margin)' : 'FIFO Gross Margin'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(analytics.totalGrossProfit)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{language === 'bn' ? 'ক্রয় মূল্য: ফিফো (FIFO)' : 'Cost Basis: FIFO Purchase'}</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {analytics.grossProfitMarginPercent}% GP
            </span>
          </div>
        </div>

        {/* Aggregate Customer Due */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t.dashboard.kpiTotalDue}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BookOpenCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatCurrency(analytics.totalOutstandingDue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{t.dashboard.kpiTotalDueSub}</span>
            <Link
              href="/khata"
              className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              {language === 'bn' ? 'বকেয়া আদায়' : 'Collect Due'} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Invoices & Inventory Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Scoped Dealership Invoices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t.dashboard.recentInvoices}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.dashboard.recentInvoicesDesc} •{' '}
                <span className="font-mono font-medium">
                  {currentAgency?.code || (language === 'bn' ? 'সকল ডিলারশিপ' : 'ALL')}
                </span>
              </p>
            </div>
            <Link
              href="/pos"
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              {language === 'bn' ? 'পিওএস বিক্রয় টার্মিনাল' : 'Open POS Terminal'}{' '}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">
                      {t.dashboard.invoiceNo} / {t.dashboard.chalanNo}
                    </th>
                    <th className="py-3 px-4">{t.dashboard.customer}</th>
                    <th className="py-3 px-4 text-right">
                      {language === 'bn' ? 'মোট লিটার' : 'Liters'}
                    </th>
                    <th className="py-3 px-4 text-right">{t.common.total}</th>
                    <th className="py-3 px-4 text-right">{t.common.due}</th>
                    <th className="py-3 px-4 text-center">{t.common.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                  {recentInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-400">
                        {t.dashboard.noInvoicesYet}. {t.dashboard.noInvoicesDesc}
                      </td>
                    </tr>
                  ) : (
                    recentInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                            {inv.invoiceNo}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {t.dashboard.chalanNo}: {inv.chalanNo}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[200px]">
                            {inv.customerName}
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Truck className="h-3 w-3 text-zinc-400" />
                            <span>{inv.vehicleNumber || (language === 'bn' ? 'কাউন্টার ডেলিভারি' : 'Counter Delivery')}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                          {formatNumber(inv.totalLiters)} L
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(inv.dueAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : inv.status === 'VOID'
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {inv.status === 'PAID'
                              ? (language === 'bn' ? 'পরিশোধিত' : 'PAID')
                              : inv.status === 'PARTIAL'
                              ? (language === 'bn' ? 'আংশিক বাকি' : 'PARTIAL')
                              : (inv.status || 'DUE')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Inventory Summary & Viscosity Volume Breakdown */}
        <div className="space-y-6">
          {/* Inventory Health Summary */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {language === 'bn' ? 'গুদাম ও মজুত স্টক সারসংক্ষেপ' : 'Inventory Health Summary'}
                </h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {language === 'bn' ? 'ডিপো স্টক' : 'Warehouse Stock'}
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {language === 'bn'
                ? 'রিয়েল-টাইম ব্যাচ মজুত, এসকেইউ সতর্কতা সীমা এবং গুদাম স্টক মূল্যায়ন।'
                : 'Real-time batch quantities, SKU stock thresholds, and warehouse valuation scoped under your current agency depot.'}
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">
                  {language === 'bn' ? 'মোট মজুত সংখ্যা:' : 'Total Stock On Hand:'}
                </span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalStockUnits)} {language === 'bn' ? 'টি' : 'Units'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">
                  {language === 'bn' ? 'সক্রিয় ব্যাচ সংখ্যা:' : 'Active Stock Batches:'}
                </span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {formatNumber(totalBatchesCount)} {language === 'bn' ? 'টি ব্যাচ' : 'Batches'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">
                  {language === 'bn' ? 'কম স্টকের সতর্কতা:' : 'Low Stock Reorder Alerts:'}
                </span>
                <span
                  className={`font-bold font-mono ${
                    lowStockBatches.length > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatNumber(lowStockBatches.length)} {language === 'bn' ? 'টি আইটেম' : 'Items'}
                </span>
              </div>
            </div>

            <Link
              href="/inventory"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'গুদাম ইনভেন্টরি দেখুন' : 'View Warehouse Inventory'}
            </Link>
          </div>

          {/* Viscosity Grade Volume Mix */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {language === 'bn' ? 'সান্দ্রতা গ্রেড ভিত্তিক বিক্রয় অনুপাত' : 'Viscosity Grade Volume Share'}
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {language === 'bn' ? 'লিটার ভিত্তিক' : 'By Liters'}
              </span>
            </div>

            <div className="space-y-3">
              {analytics.viscosityBreakdown.length === 0 ? (
                <div className="text-xs text-zinc-400 py-3 text-center">
                  {language === 'bn' ? 'এখনো কোনো বিক্রয় রেকর্ড নেই।' : 'No sales recorded yet.'}
                </div>
              ) : (
                analytics.viscosityBreakdown.map((v: any) => (
                  <div key={v.grade} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                        {v.grade}
                      </span>
                      <span className="font-mono text-zinc-500">
                        {formatNumber(v.liters)} L ({v.share}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${v.share}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
