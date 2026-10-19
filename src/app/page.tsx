import Link from "next/link";
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
} from "lucide-react";
import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getDashboardAnalytics } from "@/actions/analytics";
import { getCurrentUser } from "@/lib/auth";
import { getStoredProducts, getStoredInvoices } from "@/lib/backend-store";

export default async function DashboardPage() {
  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const analytics = await getDashboardAnalytics(currentAgency?.id);
  const currentUser = await getCurrentUser();

  const activeProducts = getStoredProducts(currentAgency?.id);
  const recentInvoices = getStoredInvoices(currentAgency?.id).slice(0, 8);

  const lowStockBatches = activeProducts.flatMap((p) =>
    (p.batches || []).filter(
      (b: any) => b.stockQuantity <= (b.minAlertStock || 5),
    ),
  );

  const totalStockUnits = activeProducts.reduce(
    (sum, p) =>
      sum + (p.batches?.reduce((bSum, b) => bSum + b.stockQuantity, 0) || 0),
    0,
  );

  const totalBatchesCount = activeProducts.reduce(
    (sum, p) => sum + (p.batches?.length || 0),
    0,
  );

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
  const isStorekeeper = currentUser.role === "STOREKEEPER";
  const isCashier = currentUser.role === "CASHIER";
  const isManager = currentUser.role === "AGENCY_MANAGER";

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {agencies.length === 0 && (
        <div className="p-6 rounded-3xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Zero Seed Mode Active • Distributorship Setup Required
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                All mock and seed data have been cleared. As Super Admin, use
                the Master Data Control Center to add your authorized dealership
                agencies, lubricant products, and customer khata ledgers.
              </p>
            </div>
          </div>
          <Link
            href="/admin/master-data"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs whitespace-nowrap shadow-sm transition-all"
          >
            + Open Master Data Hub →
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
                Active Tenancy: {currentAgency?.code || "MULTI-AGENCY"}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {isSuperAdmin ? (
                  <Crown className="w-3 h-3 text-amber-500" />
                ) : (
                  <Shield className="w-3 h-3 text-emerald-500" />
                )}
                <span>Role: {currentUser.role}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {currentAgency?.name ||
                (agencies.length === 0
                  ? "Enterprise Lubricant Distributorship"
                  : "Multi-Agency Consolidated View")}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
              {currentAgency ? (
                <>
                  Authorized Principal Distributorship:{" "}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {currentAgency.brandPrincipal}
                  </span>
                  . All product catalogs, batch allocations, document sequences,
                  and ledger balances are strictly isolated.
                </>
              ) : (
                "Consolidated enterprise overview across all authorized principal lubricant dealership agencies."
              )}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <span>
                BIN:{" "}
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {currentAgency?.binNo}
                </strong>
              </span>
              <span>•</span>
              <span>
                Trade License:{" "}
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {currentAgency?.tradeLicense}
                </strong>
              </span>
              <span>•</span>
              <span>
                District:{" "}
                <strong className="text-zinc-700 dark:text-zinc-300">
                  {currentAgency?.district || "Dhaka"}
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
                <span>Master Data Hub (CRUD)</span>
              </Link>
            )}

            {/* POS billing: visible to Super Admin, Manager, Cashier */}
            {(isSuperAdmin || isManager || isCashier) && (
              <Link
                href="/pos"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm shadow-red-600/30 transition-all hover:scale-102 cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                New POS Invoice
              </Link>
            )}

            {/* Inventory / Stock: visible to Super Admin, Manager, Storekeeper */}
            {(isSuperAdmin || isManager || isStorekeeper) && (
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 shadow-xs transition-all cursor-pointer"
              >
                <Boxes className="h-4 w-4 text-zinc-500" />
                {isStorekeeper ? "Depot Batch Stock" : "Manage Inventory"}
              </Link>
            )}

            {/* Khata / Dues: visible to Super Admin, Manager, Cashier */}
            {(isSuperAdmin || isManager || isCashier) && (
              <Link
                href="/khata"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 shadow-xs transition-all cursor-pointer"
              >
                <BookOpenCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Due Khata
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
              Invoiced Sales (SELL)
            </span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            ৳{analytics.totalRevenue.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{analytics.totalInvoicesCount} invoices issued</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {analytics.totalVolumeLiters.toLocaleString()} Liters Sold
            </span>
          </div>
        </div>

        {/* Total Purchases (BUY) */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Stock Inward (BUY)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            ৳{analytics.totalPurchasesAmount.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {analytics.totalPurchasesLiters.toLocaleString()} Liters lifted
            </span>
            <Link
              href="/analytics"
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5"
            >
              Buy Analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* FIFO Gross Profit */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              FIFO Gross Margin
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            ৳{analytics.totalGrossProfit.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Cost Basis: FIFO Purchase</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {analytics.grossProfitMarginPercent}% GP
            </span>
          </div>
        </div>

        {/* Aggregate Customer Due */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Outstanding Khata Due
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BookOpenCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            ৳{analytics.totalOutstandingDue.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Customer Credit Risk</span>
            <Link
              href="/khata"
              className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              Collect Due <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Invoices & Lubricant Fast-Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Scoped Dealership Invoices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Recent Dealership Invoices & Chalans
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sequentially scoped under{" "}
                <span className="font-mono font-medium">
                  {currentAgency?.code}
                </span>
              </p>
            </div>
            <Link
              href="/pos"
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              Open POS Terminal <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Invoice / Chalan</th>
                    <th className="py-3 px-4">Customer & Fleet</th>
                    <th className="py-3 px-4 text-right">Liters</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                  {recentInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-zinc-400"
                      >
                        No invoices generated yet for this dealership. Open the
                        POS terminal to issue an invoice.
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
                            Chalan: {inv.chalanNo}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[200px]">
                            {inv.customerName}
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Truck className="h-3 w-3 text-zinc-400" />
                            <span>
                              {inv.vehicleNumber || "Counter Delivery"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                          {inv.totalLiters} Ltr
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ৳{inv.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-red-600 dark:text-red-400">
                          ৳{inv.dueAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                              inv.status === "PAID"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                                : inv.status === "VOID"
                                  ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                            }`}
                          >
                            {inv.status}
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
                  Inventory Health Summary
                </h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                Warehouse Stock
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Real-time batch quantities, SKU stock thresholds, and warehouse valuation scoped under your current agency depot.
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Total Stock On Hand:</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {totalStockUnits.toLocaleString()} Units
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Active Stock Batches:</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {totalBatchesCount} Batches
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">
                  Low Stock Reorder Alerts:
                </span>
                <span className={`font-bold font-mono ${lowStockBatches.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {lowStockBatches.length} Items
                </span>
              </div>
            </div>

            <Link
              href="/inventory"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
            >
              View Warehouse Inventory
            </Link>
          </div>

          {/* Viscosity Grade Volume Mix */}
          <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Viscosity Grade Volume Share
              </h3>
              <span className="text-xs text-zinc-400 font-mono">By Liters</span>
            </div>

            <div className="space-y-3">
              {analytics.viscosityBreakdown.length === 0 ? (
                <div className="text-xs text-zinc-400 py-3 text-center">
                  No sales recorded yet.
                </div>
              ) : (
                analytics.viscosityBreakdown.map((v) => (
                  <div key={v.grade} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                        {v.grade}
                      </span>
                      <span className="font-mono text-zinc-500">
                        {v.liters} L ({v.share}%)
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
