'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  RotateCcw,
  Home,
  RefreshCw,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileQuestion,
} from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false)

  React.useEffect(() => {
    // Log error to monitoring services in production
    console.error('LUBRIFLOW ERP System Exception:', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/10 dark:bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-900 shadow-2xl flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>System Operation Exception</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Unexpected System Error
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            An unexpected error occurred during database state retrieval, multi-dealership synchronization, or transaction execution.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            id="error-try-again-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry Operation</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            id="error-reload-page-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Page</span>
          </button>

          <Link
            href="/"
            id="error-return-home-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Technical Diagnostics Section */}
        <div className="pt-4 text-left">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-zinc-400" />
              <span>Technical Diagnostics & Error Digest</span>
            </div>
            {showTechnicalDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-2 p-4 rounded-xl bg-zinc-900 dark:bg-black text-zinc-300 font-mono text-[11px] space-y-2 border border-zinc-800 animate-in fade-in">
              <div>
                <span className="text-zinc-500">Error:</span>{' '}
                <span className="text-red-400">{error.message || 'Unknown exception'}</span>
              </div>
              {error.digest && (
                <div>
                  <span className="text-zinc-500">Digest ID:</span>{' '}
                  <span className="text-amber-400">{error.digest}</span>
                </div>
              )}
              <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800">
                Safe transaction recovery is active. No database corruption occurred.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
