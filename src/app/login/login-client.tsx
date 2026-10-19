'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Droplet,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Building2,
  Boxes,
  CreditCard,
  Crown,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { loginUser, quickLoginAs } from '@/actions/auth'
import { AuthUser } from '@/lib/auth-types'

interface LoginClientProps {
  currentUser: AuthUser | null
  availableUsers?: any[]
}

export function LoginClient({ currentUser, availableUsers = [] }: LoginClientProps) {
  const router = useRouter()
  const [email, setEmail] = React.useState('naim@lubricants-bd.com')
  const [password, setPassword] = React.useState('••••••••')
  const [isPending, startTransition] = React.useTransition()
  const [selectedQuickUser, setSelectedQuickUser] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const res = await loginUser({ email, password })
      if (!res.success) {
        setError(('error' in res && res.error) ? res.error : 'Failed to authenticate.')
      } else {
        router.push('/')
        router.refresh()
      }
    })
  }

  const handleQuickLogin = (userId: string) => {
    setSelectedQuickUser(userId)
    setError(null)

    startTransition(async () => {
      try {
        await quickLoginAs(userId)
        router.push('/')
        router.refresh()
      } catch (err: any) {
        setError(err?.message || 'Login failed')
      }
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="h-4 w-4 text-amber-500" />
      case 'AGENCY_MANAGER':
        return <Building2 className="h-4 w-4 text-blue-500" />
      case 'STOREKEEPER':
        return <Boxes className="h-4 w-4 text-orange-500" />
      case 'CASHIER':
        return <CreditCard className="h-4 w-4 text-emerald-500" />
      default:
        return <UserCheck className="h-4 w-4 text-zinc-400" />
    }
  }

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* LEFT: Credentials Login Card (6 cols) */}
      <div className="lg:col-span-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-red-600 to-rose-700 text-white shadow-md shadow-red-600/30">
              <Droplet className="h-6 w-6 fill-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                LUBRI<span className="text-red-600">FLOW</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                  ERP
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Multi-Dealership Access Portal
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Sign in to your dealership
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select your authorized agency credentials to manage inventory batches, POS billing, and customer Khata.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dealership.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Access Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending && !selectedQuickUser ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Enterprise Lubricants BD</span>
          <span className="font-mono">v1.0 • Vercel Ready</span>
        </div>
      </div>

      {/* RIGHT: Fast Persona / Role Switcher Cards (6 cols) - SUPER ADMIN ONLY */}
      <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900/60 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-6">
        {currentUser?.role === 'SUPER_ADMIN' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Super Admin Persona Switcher
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                Authorized
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              As <strong>Super Admin (Proprietor)</strong>, you have exclusive privilege to switch into any dealership staff persona to verify permissions and workflows:
            </p>

            <div className="space-y-2.5">
              {availableUsers.map((user) => {
                const isSelected = selectedQuickUser === user.id
                const isCurrent = currentUser?.id === user.id

                return (
                  <div
                    key={user.id}
                    onClick={() => handleQuickLogin(user.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-red-500 bg-red-500/10'
                        : isCurrent
                        ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-700/60 shrink-0">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono">
                                Active Session
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {user.roleTitle}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                        {user.role}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>
                        Scope:{' '}
                        <strong className="text-zinc-700 dark:text-zinc-300">
                          {user.allowedAgencyIds.includes('*')
                            ? 'Cross-Agency'
                            : user.allowedAgencyIds.join(', ')}
                        </strong>
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-semibold group-hover:underline">
                        Switch Persona →
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full space-y-5 py-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lock className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Role Switching Restricted
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Staff impersonation and instant role switching is <strong>strictly reserved for the Super Admin (Proprietor)</strong>. Standard staff accounts must sign in with their assigned dealership credentials.
              </p>
            </div>

            {currentUser && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
                <div className="text-[11px] text-zinc-500 font-medium">Currently Authenticated As:</div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-mono text-[10px]">
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">{currentUser.email}</div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Security Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                To switch accounts, sign out and enter the authorized credentials for the target dealership staff member.
              </p>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px] leading-relaxed">
            <strong>RBAC Enforcement Notice:</strong> Storekeepers are confined to their authorized depot warehouse. Only <strong>SUPER_ADMIN</strong> has cross-agency visibility, full master data CRUD, and role switching privileges.
          </p>
        </div>
      </div>
    </div>
  )
}
