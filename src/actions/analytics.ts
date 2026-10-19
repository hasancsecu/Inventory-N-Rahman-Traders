'use server'

import {
  getStoredComprehensiveAnalytics,
  AnalyticsQuery,
  ComprehensiveAnalyticsResult,
  getStoredInvoices,
  getStoredPurchases,
  getStoredCustomers,
  getStoredAgencies,
} from '@/lib/backend-store'

export interface AnalyticsSummary {
  agencyId?: string
  totalRevenue: number
  totalGrossProfit: number
  grossProfitMarginPercent: number
  totalVolumeLiters: number
  targetVolumeLiters: number
  targetAchievementPercent: number
  totalInvoicesCount: number
  totalOutstandingDue: number
  totalPurchasesAmount: number
  totalPurchasesLiters: number
  brandVolumeBreakdown: {
    brand: string
    liters: number
    revenue: number
  }[]
  viscosityBreakdown: {
    grade: string
    liters: number
    revenue: number
    share: number
  }[]
  monthlySalesTrend: {
    month: string
    sales: number
    liters: number
    purchases: number
  }[]
}

/**
 * Computes executive KPI analytics from backend storage:
 * Lifting target tracking in Liters, FIFO Gross Profit margin, Day/Month sales, and brand breakdown.
 */
export async function getDashboardAnalytics(agencyId?: string): Promise<AnalyticsSummary> {
  const result = getStoredComprehensiveAnalytics({
    agencyId,
    timeframe: 'YEARLY',
    selectedYear: new Date().getFullYear(),
  })

  const targetVolumeLiters = 25000
  const effectiveVolume = result.sellMetrics.totalLiters
  const targetAchievementPercent = targetVolumeLiters > 0
    ? Math.round((effectiveVolume / targetVolumeLiters) * 100)
    : 0

  const monthlySalesTrend = result.timeline.map((t) => ({
    month: t.label,
    sales: t.sellAmount,
    liters: t.sellLiters,
    purchases: t.buyAmount,
  }))

  return {
    agencyId,
    totalRevenue: result.sellMetrics.totalRevenue,
    totalGrossProfit: result.sellMetrics.totalGrossProfit,
    grossProfitMarginPercent: result.sellMetrics.grossMarginPercent,
    totalVolumeLiters: result.sellMetrics.totalLiters,
    targetVolumeLiters,
    targetAchievementPercent,
    totalInvoicesCount: result.sellMetrics.invoiceCount,
    totalOutstandingDue: result.dueMetrics.totalOutstandingDue,
    totalPurchasesAmount: result.buyMetrics.totalAmount,
    totalPurchasesLiters: result.buyMetrics.totalLiters,
    brandVolumeBreakdown: result.sellMetrics.brandBreakdown,
    viscosityBreakdown: result.sellMetrics.viscosityBreakdown,
    monthlySalesTrend,
  }
}

/**
 * Full Buy, Sell, Due Analytics Server Action
 * Supports:
 * - Daily: Calendar date wise (YYYY-MM-DD)
 * - Monthly: Month wise (1-12)
 * - Yearly: Year wise (YYYY)
 * - Agency: Scoped to specific dealership or Consolidated ALL
 */
export async function getFullAnalytics(query: AnalyticsQuery): Promise<ComprehensiveAnalyticsResult> {
  return getStoredComprehensiveAnalytics(query)
}
