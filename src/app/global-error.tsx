'use client'

import * as React from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error('LUBRIFLOW Global System Error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-900 flex items-center justify-center text-red-500 font-bold text-2xl">
            !
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Critical Distributorship System Error
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A root application exception occurred. The ERP session has been secured to protect inventory and Khata ledger integrity.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Retry Session
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
