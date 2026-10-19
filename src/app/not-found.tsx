import Link from 'next/link'
import {
  Droplet,
  Compass,
  ArrowLeft,
  Home,
  ShoppingCart,
  Boxes,
  BookOpenCheck,
  Search,
} from 'lucide-react'

export const metadata = {
  title: '404 - Page Not Found • LUBRIFLOW ERP',
  description: 'The requested route or dealership record could not be found.',
}

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-xl w-full text-center space-y-8">
        {/* Visual Badge & Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-zinc-200 via-zinc-100 to-white dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center justify-center group">
            <Droplet className="w-12 h-12 text-red-600 dark:text-red-500 fill-red-600/20 animate-pulse" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-red-600 text-white font-mono font-black text-xs shadow-lg shadow-red-600/40">
            404
          </span>
        </div>

        {/* Header and Details */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
            <Compass className="w-3.5 h-3.5" />
            <span>Route or Entity Not Found</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Off-Track Lubricant Route
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            The dealership record, commercial invoice chalan, customer statement, or system page you are looking for does not exist or has been relocated.
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          <Link
            href="/"
            id="not-found-nav-overview"
            className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform">
                <Home className="h-4 w-4" />
              </div>
            </div>
            <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              Overview
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Dashboard KPIs
            </div>
          </Link>

          <Link
            href="/pos"
            id="not-found-nav-pos"
            className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </div>
            <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              POS Invoicing
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Chalan Billing
            </div>
          </Link>

          <Link
            href="/inventory"
            id="not-found-nav-inventory"
            className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              Inventory & Stock
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Batch Tracking
            </div>
          </Link>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            id="not-found-return-home-btn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Distributorship Hub</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 font-mono">
          <span>LUBRIFLOW ERP • Multi-Dealership Distribution</span>
        </div>
      </div>
    </div>
  )
}
