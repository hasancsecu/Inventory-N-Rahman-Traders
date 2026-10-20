'use client'

import * as React from 'react'
import {
  TrendingUp,
  ShoppingCart,
  BookOpenCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  Droplet,
  RefreshCw,
  Award,
  BarChart3,
  DollarSign,
  PackageCheck,
  Truck,
  CreditCard,
  Crown,
  Layers,
  Sparkles,
  ArrowRight,
  PieChart,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { AgencySummary } from '@/actions/agency'
import { getFullAnalytics } from '@/actions/analytics'
import { ComprehensiveAnalyticsResult, AnalyticsQuery } from '@/lib/backend-store'
import { AuthUser } from '@/lib/auth-types'
import { useLanguage } from '@/context/language-context'
import { BENGALI_MONTHS, ENGLISH_MONTHS } from '@/lib/i18n/translations'
import Link from 'next/link'

interface AnalyticsClientProps {
  currentAgency: AgencySummary | null
  agencies: AgencySummary[]
  initialAnalytics: ComprehensiveAnalyticsResult
  currentUser?: AuthUser
}

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027]

export function AnalyticsClient({
  currentAgency,
  agencies,
  initialAnalytics,
  currentUser,
}: AnalyticsClientProps) {
  const { t, language } = useLanguage()
  const monthNames = language === 'bn' ? BENGALI_MONTHS : ENGLISH_MONTHS
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN'

  // Timeframe and Scope State
  const [timeframe, setTimeframe] = React.useState<'DAILY' | 'MONTHLY' | 'YEARLY'>(
    initialAnalytics.timeframe || 'MONTHLY'
  )
  const [selectedAgencyId, setSelectedAgencyId] = React.useState<string>(
    initialAnalytics.agencyId || currentAgency?.id || 'ALL'
  )
  const [selectedDate, setSelectedDate] = React.useState<string>(
    initialAnalytics.selectedDate || '2026-10-19'
  )
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    initialAnalytics.selectedMonth || 10
  )
  const [selectedYear, setSelectedYear] = React.useState<number>(
    initialAnalytics.selectedYear || 2026
  )

  // Active Deep Dive Tab
  const [activeTab, setActiveTab] = React.useState<'BUY' | 'SELL' | 'DUE' | 'TIMELINE'>('SELL')

  // Analytics Data & Transition
  const [analytics, setAnalytics] = React.useState<ComprehensiveAnalyticsResult>(initialAnalytics)
  const [isPending, startTransition] = React.useTransition()

  // Central fetcher
  const updateAnalytics = (overrides?: Partial<AnalyticsQuery>) => {
    const q: AnalyticsQuery = {
      timeframe: overrides?.timeframe ?? timeframe,
      agencyId: (overrides?.agencyId ?? selectedAgencyId) === 'ALL' ? undefined : (overrides?.agencyId ?? selectedAgencyId),
      selectedDate: overrides?.selectedDate ?? selectedDate,
      selectedMonth: overrides?.selectedMonth ?? selectedMonth,
      selectedYear: overrides?.selectedYear ?? selectedYear,
    }

    startTransition(async () => {
      try {
        const result = await getFullAnalytics(q)
        setAnalytics(result)
      } catch (err) {
        console.error('Failed to load analytics:', err)
      }
    })
  }

  // Timeframe switch handler
  const handleTimeframeChange = (newTf: 'DAILY' | 'MONTHLY' | 'YEARLY') => {
    setTimeframe(newTf)
    updateAnalytics({ timeframe: newTf })
  }

  // Agency scope switch handler
  const handleAgencyChange = (agencyId: string) => {
    setSelectedAgencyId(agencyId)
    updateAnalytics({ agencyId })
  }

  // Daily calendar handlers
  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr)
    updateAnalytics({ selectedDate: dateStr })
  }

  const shiftDay = (deltaDays: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + deltaDays)
    const newDateStr = current.toISOString().slice(0, 10)
    setSelectedDate(newDateStr)
    updateAnalytics({ selectedDate: newDateStr })
  }

  const resetToday = () => {
    const todayStr = '2026-10-19'
    setSelectedDate(todayStr)
    updateAnalytics({ selectedDate: todayStr })
  }

  // Monthly calendar handlers
  const handleMonthChange = (monthNum: number) => {
    setSelectedMonth(monthNum)
    updateAnalytics({ selectedMonth: monthNum })
  }

  const shiftMonth = (deltaMonths: number) => {
    let nextMonth = selectedMonth + deltaMonths
    let nextYear = selectedYear
    if (nextMonth < 1) {
      nextMonth = 12
      nextYear -= 1
    } else if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }
    setSelectedMonth(nextMonth)
    setSelectedYear(nextYear)
    updateAnalytics({ selectedMonth: nextMonth, selectedYear: nextYear })
  }

  const resetCurrentMonth = () => {
    setSelectedMonth(10)
    setSelectedYear(2026)
    updateAnalytics({ selectedMonth: 10, selectedYear: 2026 })
  }

  // Yearly calendar handlers
  const handleYearChange = (yearNum: number) => {
    setSelectedYear(yearNum)
    updateAnalytics({ selectedYear: yearNum })
  }

  const shiftYear = (deltaYears: number) => {
    const nextYear = selectedYear + deltaYears
    setSelectedYear(nextYear)
    updateAnalytics({ selectedYear: nextYear })
  }

  const resetCurrentYear = () => {
    setSelectedYear(2026)
    updateAnalytics({ selectedYear: 2026 })
  }

  // Format active period label
  const getActivePeriodLabel = () => {
    if (timeframe === 'DAILY') {
      const d = new Date(selectedDate)
      return d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
    if (timeframe === 'MONTHLY') {
      return `${monthNames[selectedMonth - 1]} ${selectedYear}`
    }
    return language === 'bn' ? `সম্পূর্ণ বছর ${selectedYear}` : `Full Year ${selectedYear}`
  }

  const { buyMetrics, sellMetrics, dueMetrics, timeline } = analytics

  // Calculate timeline max for proportional chart rendering
  const maxTimelineAmount = Math.max(
    ...timeline.map((t) => Math.max(t.buyAmount, t.sellAmount, t.dueCollected, 1000))
  )

  return (
    <div className="space-y-8">
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & INTERACTIVE CALENDAR CONTROL HUB                      */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-red-600 text-white shadow-md shadow-red-500/20">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                  <span>{language === 'bn' ? 'ক্রয়, বিক্রয় ও বকেয়া অ্যানালিটিক্স' : 'Buy, Sell & Due Analytics'}</span>
                  {isPending && (
                    <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
                  )}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {language === 'bn'
                    ? 'সংগ্রহ (ক্রয়), আয় (বিক্রয়) এবং খাতা লেজার (বকেয়া) সংক্রান্ত সম্পূর্ণ বাণিজ্যিক পরিসংখ্যান।'
                    : 'Full commercial intelligence across Procurement (Buy), Revenue (Sell), and Khata Ledgers (Due).'}
                </p>
              </div>
            </div>
          </div>

          {/* Dealership Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              {t.analytics.tenancy}
            </span>
            <select
              value={selectedAgencyId}
              onChange={(e) => handleAgencyChange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            >
              <option value="ALL">{t.analytics.allAgenciesConsolidated}</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.code} • {agency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar & Timeframe Navigation Bar */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Timeframe Mode Switcher */}
          <div className="inline-flex p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 self-start">
            <button
              onClick={() => handleTimeframeChange('DAILY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timeframe === 'DAILY'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{t.analytics.timeframeDaily}</span>
            </button>
            <button
              onClick={() => handleTimeframeChange('MONTHLY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timeframe === 'MONTHLY'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t.analytics.timeframeMonthly}</span>
            </button>
            <button
              onClick={() => handleTimeframeChange('YEARLY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timeframe === 'YEARLY'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{t.analytics.timeframeYearly}</span>
            </button>
          </div>

          {/* Active Calendar Control based on Timeframe Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {timeframe === 'DAILY' && (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => shiftDay(-1)}
                  title="Previous Day"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => shiftDay(1)}
                  title="Next Day"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={resetToday}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/20 cursor-pointer"
                >
                  {t.analytics.today}
                </button>
              </div>
            )}

            {timeframe === 'MONTHLY' && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => shiftMonth(-1)}
                  title="Previous Month"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => shiftMonth(1)}
                  title="Next Month"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={resetCurrentMonth}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/20 cursor-pointer"
                >
                  {t.analytics.thisMonth}
                </button>
              </div>
            )}

            {timeframe === 'YEARLY' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => shiftYear(-1)}
                  title="Previous Year"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="px-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {AVAILABLE_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {language === 'bn' ? `ক্যালেন্ডার বছর ${y}` : `Calendar Year ${y}`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => shiftYear(1)}
                  title="Next Year"
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={resetCurrentYear}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/20 cursor-pointer"
                >
                  {t.analytics.currentYear}
                </button>
              </div>
            )}

            {/* Active Period Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold font-mono shadow-xs">
              {getActivePeriodLabel()}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. THE THREE PILLARS: BUY, SELL, DUE EXECUTIVE SUMMARY CARDS           */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* BUY CARD */}
        <div
          onClick={() => setActiveTab('BUY')}
          className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'BUY'
              ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white dark:to-zinc-900 shadow-md ring-2 ring-amber-500/20'
              : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-400/60 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              <span>{t.analytics.buyPillar}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 font-bold">
              {buyMetrics.orderCount} {t.analytics.inwardPOs}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50">
              ৳{buyMetrics.totalAmount.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <span>{t.analytics.litersLifted}</span>
              <strong className="text-zinc-900 dark:text-zinc-200 font-mono">
                {buyMetrics.totalLiters.toLocaleString()} Ltr
              </strong>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>
              {t.analytics.avgRate}{' '}
              <strong className="text-zinc-800 dark:text-zinc-200 font-mono">
                ৳{buyMetrics.avgRatePerLiter}/L
              </strong>
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              {t.analytics.viewInwardDetails}
            </span>
          </div>
        </div>

        {/* SELL CARD */}
        <div
          onClick={() => setActiveTab('SELL')}
          className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'SELL'
              ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white dark:to-zinc-900 shadow-md ring-2 ring-emerald-500/20'
              : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-400/60 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>{t.analytics.sellPillar}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-bold">
              {sellMetrics.invoiceCount} {t.analytics.invoicesCount}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50">
              ৳{sellMetrics.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <span>{t.analytics.litersSold}</span>
              <strong className="text-zinc-900 dark:text-zinc-200 font-mono">
                {sellMetrics.totalLiters.toLocaleString()} Ltr
              </strong>
              <span>({t.analytics.avgSellingPrice} ৳{sellMetrics.avgSellingPricePerLiter}/L)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>
              {t.analytics.fifoGrossProfit}{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                ৳{sellMetrics.totalGrossProfit.toLocaleString()} ({sellMetrics.grossMarginPercent}%)
              </strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              {t.analytics.viewSalesDetails}
            </span>
          </div>
        </div>

        {/* DUE CARD */}
        <div
          onClick={() => setActiveTab('DUE')}
          className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
            activeTab === 'DUE'
              ? 'border-rose-500 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white dark:to-zinc-900 shadow-md ring-2 ring-rose-500/20'
              : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-400/60 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <BookOpenCheck className="h-4 w-4" />
              <span>{t.analytics.duePillar}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-400 font-bold">
              {dueMetrics.collectionEfficiencyPercent}% {t.analytics.collectionEff}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50">
              ৳{dueMetrics.dueCollected.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
              <span>{t.analytics.newDueIssued}</span>
              <strong className="text-zinc-900 dark:text-zinc-200 font-mono">
                ৳{dueMetrics.newDueCreated.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>
              {t.analytics.totalOutstanding}{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                ৳{dueMetrics.totalOutstandingDue.toLocaleString()}
              </strong>
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              {t.analytics.viewKhataDetails}
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. DEEP DIVE TABS NAVIGATION                                          */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('SELL')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'SELL'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>{t.analytics.salesAnalyticsTab}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-zinc-800 font-mono">
            ৳{Math.round(sellMetrics.totalRevenue / 1000)}k
          </span>
        </button>

        <button
          onClick={() => setActiveTab('BUY')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'BUY'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{t.analytics.procurementAnalyticsTab}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-zinc-800 font-mono">
            ৳{Math.round(buyMetrics.totalAmount / 1000)}k
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DUE')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'DUE'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BookOpenCheck className="h-4 w-4" />
          <span>{t.analytics.dueAnalyticsTab}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 dark:bg-zinc-800 font-mono">
            ৳{Math.round(dueMetrics.dueCollected / 1000)}k
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'TIMELINE'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>{t.analytics.comparativeProgressionTab}</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. TAB CONTENTS                                                       */}
      {/* --------------------------------------------------------------------- */}

      {/* --- TAB: SELL ANALYTICS --- */}
      {activeTab === 'SELL' && (
        <div className="space-y-6">
          {/* Viscosity Grade Performance & Brand Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Viscosity Grade Share */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Viscosity Grade Volume & Revenue Breakdown
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {sellMetrics.viscosityBreakdown.length} Grades Active
                </span>
              </div>

              {sellMetrics.viscosityBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No sales recorded for this calendar period.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {sellMetrics.viscosityBreakdown.map((item) => (
                    <div key={item.grade} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          {item.grade}
                        </span>
                        <div className="flex items-center gap-3 font-mono text-zinc-600 dark:text-zinc-400">
                          <span>{item.liters.toLocaleString()} Ltr</span>
                          <strong className="text-zinc-900 dark:text-zinc-100">
                            ৳{item.revenue.toLocaleString()}
                          </strong>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                            {item.share}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, item.share)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Principal Brand Distribution */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Brand Principal Performance Share
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Multi-Entity Distributorship
                </span>
              </div>

              {sellMetrics.brandBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No brand sales recorded for this period.
                </div>
              ) : (
                <div className="space-y-3">
                  {sellMetrics.brandBreakdown.map((b) => {
                    const share =
                      sellMetrics.totalRevenue > 0
                        ? Math.round((b.revenue / sellMetrics.totalRevenue) * 100)
                        : 0
                    return (
                      <div
                        key={b.brand}
                        className="p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-600 text-xs">
                            {b.brand.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {b.brand}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {b.liters.toLocaleString()} Liters Dispatched
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                            ৳{b.revenue.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-emerald-600">
                            {share}% Revenue Share
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Sales Commercial Invoices */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Sales Invoices & Chalans in Period
                </h3>
                <p className="text-xs text-zinc-500">
                  Showing invoices generated in {getActivePeriodLabel()}
                </p>
              </div>
              <Link
                href="/pos"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                + POS Terminal →
              </Link>
            </div>

            {sellMetrics.recentSales.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No invoices found for this calendar selection.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Dealership</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Volume</th>
                      <th className="py-3 px-4 text-right">Amount (৳)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium">
                    {sellMetrics.recentSales.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                          {inv.agencyCode}
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                          {inv.customerName}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                          {new Date(inv.salesDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {inv.totalLiters} L
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ৳{inv.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/invoices/${inv.id}/print`}
                            className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline"
                          >
                            Print →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: BUY ANALYTICS --- */}
      {activeTab === 'BUY' && (
        <div className="space-y-6">
          {/* Supplier Procurement Share & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supplier Table */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Principal Supplier Lifting & Spend
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {buyMetrics.supplierBreakdown.length} Suppliers
                </span>
              </div>

              {buyMetrics.supplierBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No inward purchases recorded for this calendar period.
                </div>
              ) : (
                <div className="space-y-3">
                  {buyMetrics.supplierBreakdown.map((s) => {
                    const share =
                      buyMetrics.totalAmount > 0
                        ? Math.round((s.amount / buyMetrics.totalAmount) * 100)
                        : 0
                    return (
                      <div
                        key={s.supplier}
                        className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {s.supplier}
                          </span>
                          <span className="font-mono font-extrabold text-zinc-900 dark:text-zinc-100">
                            ৳{s.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <span>Volume: {s.liters.toLocaleString()} Liters</span>
                          <span className="font-bold text-amber-600">{share}% Spend Share</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                            style={{ width: `${Math.max(5, share)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Procurement Volume & Landed Cost Metrics */}
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PackageCheck className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Procurement Volume & Cost Metrics
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-[11px] text-zinc-500 font-medium">Inward Volume</span>
                    <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                      {buyMetrics.totalLiters.toLocaleString()} L
                    </div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1 block">
                      Total Stock Inwarded
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40">
                    <span className="text-[11px] text-zinc-500 font-medium">Inward Rate Index</span>
                    <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                      ৳{buyMetrics.avgRatePerLiter}
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Per Net Liter (Landed)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  Tenancy Procurement Policy:
                </span>
                Bulk purchase orders are automatically ingested into FIFO inventory batches upon storekeeper confirmation.
              </div>
            </div>
          </div>

          {/* Recent Inward Purchase Orders */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Procurement Consignments
                </h3>
                <p className="text-xs text-zinc-500">
                  Purchases received in {getActivePeriodLabel()}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600">
                {buyMetrics.recentPurchases.length} Orders
              </span>
            </div>

            {buyMetrics.recentPurchases.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No purchase orders recorded for this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">PO Number</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Agency</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Liters</th>
                      <th className="py-3 px-4 text-right">Total Cost (৳)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium">
                    {buyMetrics.recentPurchases.map((po) => (
                      <tr key={po.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {po.poNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                          {po.supplierName}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500">
                          {po.agencyCode}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                          {new Date(po.orderDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {po.totalLiters.toLocaleString()} L
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ৳{po.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: DUE & KHATA ANALYTICS --- */}
      {activeTab === 'DUE' && (
        <div className="space-y-6">
          {/* Recovery Gauge & Khata Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                <span>Collection Efficiency</span>
              </span>
              <div className="text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50">
                {dueMetrics.collectionEfficiencyPercent}%
              </div>
              <p className="text-xs text-zinc-500">
                Ratio of credit sales recovered via Money Receipts in this period.
              </p>
              <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, dueMetrics.collectionEfficiencyPercent)}%` }}
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                New Credit Invoiced
              </span>
              <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
                ৳{dueMetrics.newDueCreated.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-500">
                Total commercial customer debits booked across dealerships.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Cash Collections
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                ৳{dueMetrics.dueCollected.toLocaleString()}
              </div>
              <p className="text-xs text-zinc-500">
                Recovered through Cash, Bank Transfers, and bKash collections.
              </p>
            </div>
          </div>

          {/* Recent Money Receipts Table */}
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Money Receipts & Cash Collections
                </h3>
                <p className="text-xs text-zinc-500">
                  Customer payment credits booked in {getActivePeriodLabel()}
                </p>
              </div>
              <Link
                href="/khata"
                className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline"
              >
                + Khata Ledger Hub →
              </Link>
            </div>

            {dueMetrics.recentCollections.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No money receipts recorded for this calendar period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-mono uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Receipt #</th>
                      <th className="py-3 px-4">Agency</th>
                      <th className="py-3 px-4">Customer ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Method / Bank</th>
                      <th className="py-3 px-4 text-right">Amount (৳)</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium">
                    {dueMetrics.recentCollections.map((l) => (
                      <tr key={l.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {l.referenceNumber}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500">
                          {l.agencyCode}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                          {l.customerId}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                          {new Date(l.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {l.paymentMethod || 'CASH'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +৳{l.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-[11px] max-w-xs truncate">
                          {l.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: COMPARATIVE PROGRESSION (BUY vs SELL vs DUE) --- */}
      {activeTab === 'TIMELINE' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  <span>Comparative Periodic Progression (Buy vs Sell vs Due)</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Side-by-side progression across {getActivePeriodLabel()}
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">Buy (Procurement)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">Sell (Revenue)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">Due Collected</span>
                </div>
              </div>
            </div>

            {/* Progression Multi-Bar Chart */}
            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {timeline.map((entry) => {
                const buyPct = Math.min(100, Math.round((entry.buyAmount / maxTimelineAmount) * 100))
                const sellPct = Math.min(100, Math.round((entry.sellAmount / maxTimelineAmount) * 100))
                const duePct = Math.min(100, Math.round((entry.dueCollected / maxTimelineAmount) * 100))

                return (
                  <div key={entry.label} className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-800 dark:text-zinc-200 font-mono">
                        {entry.label}
                      </span>
                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <span className="text-amber-600">
                          Buy: ৳{entry.buyAmount.toLocaleString()}
                        </span>
                        <span className="text-emerald-600">
                          Sell: ৳{entry.sellAmount.toLocaleString()}
                        </span>
                        <span className="text-blue-600">
                          Due Collected: ৳{entry.dueCollected.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Buy Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400 w-12 text-right">
                          BUY
                        </span>
                        <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(2, buyPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Sell Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400 w-12 text-right">
                          SELL
                        </span>
                        <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(2, sellPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Due Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400 w-12 text-right">
                          DUE
                        </span>
                        <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(2, duePct)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
