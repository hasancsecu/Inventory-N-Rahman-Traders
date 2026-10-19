'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react'

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function paginateList<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResult<T> {
  const safePageSize = Math.max(1, Math.min(100, Math.floor(Number(pageSize)) || 10))
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / safePageSize))
  const safePage = Math.min(Math.max(1, Math.floor(Number(page)) || 1), totalPages)
  const startIndex = (safePage - 1) * safePageSize
  const sliced = items.slice(startIndex, startIndex + safePageSize)

  return {
    items: sliced,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  }
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  isLoading?: boolean
  itemName?: string
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  itemName = 'records',
  className = '',
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1)
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeTotalPages)

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems)

  // Calculate visible page buttons with ellipsis
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    const delta = 1 // number of pages to show around current page

    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      const start = Math.max(2, safeCurrentPage - delta)
      const end = Math.min(safeTotalPages - 1, safeCurrentPage + delta)

      if (start > 2) {
        pages.push('...')
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (end < safeTotalPages - 1) {
        pages.push('...')
      }

      pages.push(safeTotalPages)
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-xs ${className}`}
    >
      {/* Left: Summary and Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-zinc-500 dark:text-zinc-400">
        <div>
          Showing{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {startItem}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {endItem}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {totalItems}
          </span>{' '}
          {itemName}
        </div>

        {isLoading && (
          <div className="inline-flex items-center gap-1.5 text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
            <span className="text-[11px]">Loading page...</span>
          </div>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px]">Per page:</span>
            <select
              value={pageSize}
              disabled={isLoading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-red-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1 || isLoading}
          title="First Page"
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1 || isLoading}
          title="Previous Page"
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-zinc-400 font-mono text-[11px]"
                >
                  …
                </span>
              )
            }

            const pageNum = Number(page)
            const isCurrent = pageNum === safeCurrentPage

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-red-600 text-white shadow-xs shadow-red-600/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          title="Next Page"
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          title="Last Page"
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
