'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Landmark,
  FileText,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { switchActiveAgency, AgencySummary } from '@/actions/agency'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'

interface AgencySwitcherProps {
  currentAgency: AgencySummary | null
  agencies: AgencySummary[]
  isFullWidth?: boolean
}

export function AgencySwitcher({ currentAgency, agencies, isFullWidth = false }: AgencySwitcherProps) {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [showDetails, setShowDetails] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectAgency = (agencyId: string) => {
    setIsOpen(false)
    startTransition(async () => {
      await switchActiveAgency(agencyId)
      router.refresh()
    })
  }

  const getBrandBadge = (code: string) => {
    switch (code.toUpperCase()) {
      case 'CALTEX':
        return {
          bg: 'bg-red-500/10 dark:bg-red-950/40 border-red-500/30 text-red-600 dark:text-red-400',
          dot: 'bg-red-500',
        }
      case 'SHELL':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-600 dark:text-amber-400',
          dot: 'bg-amber-500',
        }
      case 'MOBIL':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/30 text-blue-600 dark:text-blue-400',
          dot: 'bg-blue-500',
        }
      case 'TOTAL':
      case 'TOTALENERGIES':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          dot: 'bg-emerald-500',
        }
      default:
        return {
          bg: 'bg-zinc-500/10 dark:bg-zinc-800 border-zinc-500/30 text-zinc-600 dark:text-zinc-300',
          dot: 'bg-zinc-500',
        }
    }
  }

  const currentBadge = currentAgency ? getBrandBadge(currentAgency.code) : getBrandBadge('')

  return (
    <div className={`relative ${isFullWidth ? 'w-full block' : 'inline-block text-left'}`} ref={dropdownRef}>
      {/* Main Switcher Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all cursor-pointer group ${
          isFullWidth ? 'w-full justify-between' : 'max-w-[170px] sm:max-w-[280px]'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border font-bold text-xs tracking-wider shadow-inner shrink-0 ${currentBadge.bg}`}
          >
            {currentAgency ? currentAgency.code.slice(0, 3) : 'ERP'}
          </div>

          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                {currentAgency ? currentAgency.code : (language === 'bn' ? 'কোনো এজেন্সি নেই' : 'No Agency')}
              </span>
              <span className="hidden sm:inline font-medium text-xs text-zinc-500 truncate">
                - {currentAgency?.brandPrincipal?.split(' ')[0] || (language === 'bn' ? 'সেটআপ' : 'Setup')}
              </span>
              {isPending && <RefreshCw className="h-3 w-3 animate-spin text-zinc-400 shrink-0" />}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentBadge.dot}`} />
              <span className="truncate">
                {currentAgency?.name || (language === 'bn' ? 'মাস্টার ডেটায় তৈরি করুন' : 'Create in Master Data')}
              </span>
            </div>
          </div>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 shrink-0 transition-transform duration-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu - smart alignment */}
      {isOpen && (
        <div
          className={`absolute mt-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-950/20 dark:shadow-black/70 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isFullWidth ? 'left-0 right-0 w-full' : 'right-0 sm:left-0 w-80 sm:w-96 max-w-[92vw]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-50/70 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                {language === 'bn' ? 'অনুমোদিত ডিলারশিপসমূহ' : 'Authorized Dealerships'} ({agencies.length})
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-md">
              {language === 'bn' ? 'মাল্টি-এজেন্সি মোড' : 'Multi-Entity Mode'}
            </span>
          </div>

          {/* List of Agencies */}
          <div className="p-2 max-h-[340px] overflow-y-auto space-y-1">
            {agencies.length === 0 ? (
              <div className="py-6 px-4 text-center space-y-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {language === 'bn'
                    ? 'এখনো কোনো ডিলারশিপ এজেন্সি কনফিগার করা হয়নি।'
                    : 'No dealership agencies configured yet.'}
                </p>
                <Link
                  href="/admin/master-data"
                  onClick={() => setIsOpen(false)}
                  className="inline-block px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/20"
                >
                  {language === 'bn' ? 'মাস্টার ডেটায় ডিলারশিপ যোগ করুন →' : 'Add Dealership in Master Data →'}
                </Link>
              </div>
            ) : (
              agencies.map((agency) => {
                const isSelected = agency.id === currentAgency?.id
                const badge = getBrandBadge(agency.code)

                return (
                  <div
                    key={agency.id}
                    onClick={() => handleSelectAgency(agency.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg border font-bold text-xs tracking-wider shrink-0 ${badge.bg}`}
                    >
                      {agency.code.slice(0, 3)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {agency.name}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                        )}
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                        <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          {agency.code}
                        </span>
                        <span>•</span>
                        <span className="truncate">{agency.brandPrincipal}</span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                          BIN: {agency.binNo}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                          TL: {agency.tradeLicense.slice(0, 14)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Metadata Drawer Trigger */}
          {currentAgency && (
            <div className="p-3 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer font-medium"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                {showDetails
                  ? (language === 'bn' ? 'আইনি তথ্য লুকান' : 'Hide Legal Metadata')
                  : (language === 'bn' ? 'এজেন্সির আইনি ও ব্যাংক বিবরণ দেখুন' : 'View Agency Legal & Bank Details')}
              </button>
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentAgency.district}, BD
              </span>
            </div>
          )}

          {/* Expanded Legal & Bank Metadata */}
          {showDetails && currentAgency && (
            <div className="p-4 bg-zinc-100/70 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-semibold">{language === 'bn' ? 'ট্রেড লাইসেন্স:' : 'Trade License:'}</span>
                <span className="font-mono">{currentAgency.tradeLicense}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-semibold">{language === 'bn' ? 'বিআইএন নম্বর:' : 'BIN Number:'}</span>
                <span className="font-mono">{currentAgency.binNo}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-semibold">{language === 'bn' ? 'ডিপো ঠিকানা:' : 'Depot Address:'}</span>
                <span className="truncate">{currentAgency.address}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-semibold">{language === 'bn' ? 'হটলাইন:' : 'Hotline:'}</span>
                <span className="font-mono">{currentAgency.phone}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
