'use client'

import * as React from 'react'
import {
  Users,
  Shield,
  Plus,
  Crown,
  Building2,
  Boxes,
  CreditCard,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react'
import { AgencySummary } from '@/actions/agency'
import { AuthUser, PERMISSION_DEFINITIONS } from '@/lib/auth-types'
import { createNewUser, createNewRole, toggleUserStatus, getPaginatedUsersAction } from '@/actions/users'
import { Pagination } from '@/components/ui/pagination'
import { UserRole } from '@prisma/client'
import { useLanguage } from '@/context/language-context'

interface UsersClientProps {
  currentUser: AuthUser
  agencies: AgencySummary[]
  initialUsers: any[]
  initialRoles: any[]
}

export function UsersClient({
  currentUser,
  agencies,
  initialUsers,
  initialRoles,
}: UsersClientProps) {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = React.useState<'users' | 'roles'>('users')
  const [users, setUsers] = React.useState(initialUsers)
  const [roles, setRoles] = React.useState(initialRoles)
  const [searchQuery, setSearchQuery] = React.useState('')

  // New User Modal State
  const [userModalOpen, setUserModalOpen] = React.useState(false)
  const [userName, setUserName] = React.useState('')
  const [userEmail, setUserEmail] = React.useState('')
  const [userRole, setUserRole] = React.useState<UserRole>(UserRole.STOREKEEPER)
  const [userCustomRoleId, setUserCustomRoleId] = React.useState<string>('')
  const [selectedAgencyIds, setSelectedAgencyIds] = React.useState<string[]>([
    agencies[0]?.id || '',
  ])
  const [isSubmittingUser, setIsSubmittingUser] = React.useState(false)
  const [userError, setUserError] = React.useState<string | null>(null)
  const [userSuccess, setUserSuccess] = React.useState<string | null>(null)

  // New Role Modal State
  const [roleModalOpen, setRoleModalOpen] = React.useState(false)
  const [roleSlug, setRoleSlug] = React.useState('')
  const [roleTitle, setRoleTitle] = React.useState('')
  const [roleDescription, setRoleDescription] = React.useState('')
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([
    'inventory:view',
    'inventory:decant',
  ])
  const [isSubmittingRole, setIsSubmittingRole] = React.useState(false)
  const [roleError, setRoleError] = React.useState<string | null>(null)
  const [roleSuccess, setRoleSuccess] = React.useState<string | null>(null)

  // Backend Pagination state for Users
  const [userPage, setUserPage] = React.useState(1)
  const [userPageSize, setUserPageSize] = React.useState(10)
  const [isUserPageLoading, setIsUserPageLoading] = React.useState(false)
  const [paginatedUsers, setPaginatedUsers] = React.useState<{
    items: any[]
    total: number
    totalPages: number
  }>(() => {
    const initialFiltered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return {
      items: initialFiltered.slice(0, 10),
      total: initialFiltered.length,
      totalPages: Math.max(1, Math.ceil(initialFiltered.length / 10)),
    }
  })

  // Debounced backend pagination fetch for Users
  React.useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setIsUserPageLoading(true)
      try {
        const res = await getPaginatedUsersAction({
          page: userPage,
          pageSize: userPageSize,
          search: searchQuery,
        })
        if (active && res.success && res.data) {
          setPaginatedUsers({
            items: res.data.items,
            total: res.data.total,
            totalPages: res.data.totalPages,
          })
        }
      } catch (err) {
        console.error('Failed to fetch paginated users', err)
      } finally {
        if (active) setIsUserPageLoading(false)
      }
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [userPage, userPageSize, searchQuery, users])

  const handleToggleAgencySelection = (agencyId: string) => {
    if (selectedAgencyIds.includes(agencyId)) {
      if (selectedAgencyIds.length > 1) {
        setSelectedAgencyIds(selectedAgencyIds.filter((id) => id !== agencyId))
      }
    } else {
      setSelectedAgencyIds([...selectedAgencyIds, agencyId])
    }
  }

  const handleTogglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((k) => k !== key))
    } else {
      setSelectedPermissions([...selectedPermissions, key])
    }
  }

  // Submit New User
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingUser(true)
    setUserError(null)
    setUserSuccess(null)

    try {
      const res = await createNewUser({
        name: userName,
        email: userEmail,
        role: userRole,
        customRoleId: userCustomRoleId || undefined,
        agencyIds: selectedAgencyIds,
      })

      if (!res.success) {
        setUserError(res.error || 'Failed to create user.')
      } else {
        setUserSuccess(`User ${userName} successfully added!`)
        setUsers([res.user, ...users])
        setUserName('')
        setUserEmail('')
        setTimeout(() => setUserModalOpen(false), 1200)
      }
    } catch (err: any) {
      setUserError(err?.message || 'Error occurred creating user.')
    } finally {
      setIsSubmittingUser(false)
    }
  }

  // Submit New Role
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingRole(true)
    setRoleError(null)
    setRoleSuccess(null)

    try {
      const res = await createNewRole({
        name: roleSlug.trim().toUpperCase(),
        title: roleTitle.trim(),
        description: roleDescription,
        permissions: selectedPermissions,
      })

      if (!res.success) {
        setRoleError(res.error || 'Failed to create role.')
      } else {
        setRoleSuccess(`Custom Role ${roleTitle} successfully created!`)
        setRoles([...roles, res.role])
        setRoleSlug('')
        setRoleTitle('')
        setRoleDescription('')
        setTimeout(() => setRoleModalOpen(false), 1200)
      }
    } catch (err: any) {
      setRoleError(err?.message || 'Error occurred creating role.')
    } finally {
      setIsSubmittingRole(false)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    await toggleUserStatus(userId, !currentStatus)
    setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u)))
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
      case 'AGENCY_MANAGER':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
      case 'STOREKEEPER':
        return 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800'
      case 'CASHIER':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t.users.usersHeaderTitle}
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t.users.usersHeaderSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setUserError(null)
              setUserSuccess(null)
              setUserModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t.users.addUser}
          </button>
          <button
            onClick={() => {
              setRoleError(null)
              setRoleSuccess(null)
              setRoleModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold text-xs text-zinc-800 dark:text-zinc-200 shadow-xs cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            {t.users.createCustomRole}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="h-4 w-4" />
          {t.users.tabStaff} ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Shield className="h-4 w-4" />
          {t.users.tabRoles} ({roles.length})
        </button>
      </div>

      {/* TAB 1: USERS & DEALERSHIP ACCESS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={t.users.searchStaffPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setUserPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">{t.users.userDetails}</th>
                    <th className="py-3 px-4">{t.users.primaryRole}</th>
                    <th className="py-3 px-4">{t.users.authorizedAccess}</th>
                    <th className="py-3 px-4 text-center">{t.users.status}</th>
                    <th className="py-3 px-4 text-right">{t.users.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                  {paginatedUsers.items.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {u.name}
                        </div>
                        <div className="text-zinc-500 font-mono text-[11px] mt-0.5">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role === 'SUPER_ADMIN' && <Crown className="h-3 w-3" />}
                          {u.role}
                        </span>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          {u.roleTitle || u.role}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.allowedAgencyIds?.includes('*') ? (
                            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-mono text-[10px] font-bold">
                              {language === 'bn' ? 'সকল অনুমোদিত ডিলারশিপ' : 'All Authorized Dealerships'}
                            </span>
                          ) : (
                            (u.allowedAgencyIds || []).map((agencyId: string) => {
                              const agency = agencies.find((a) => a.id === agencyId)
                              return (
                                <span
                                  key={agencyId}
                                  className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-semibold"
                                >
                                  {agency?.code || agencyId}
                                </span>
                              )
                            })
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {u.isActive ? t.users.activeStatus : t.users.inactiveStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                        >
                          {u.isActive
                            ? language === 'bn'
                              ? 'নিষ্ক্রিয় করুন'
                              : 'Deactivate'
                            : language === 'bn'
                            ? 'সক্রিয় করুন'
                            : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Users Cards */}
            <div className="sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedUsers.items.map((u) => (
                <div key={u.id} className="p-4 space-y-3 bg-white dark:bg-zinc-900">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {u.name}
                      </div>
                      <div className="text-zinc-500 font-mono text-xs mt-0.5">
                        {u.email}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {u.isActive ? t.users.activeStatus : t.users.inactiveStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role === 'SUPER_ADMIN' && <Crown className="h-3 w-3" />}
                      {u.role}
                    </span>
                    <span className="text-xs text-zinc-500">
                      • {u.roleTitle || u.role}
                    </span>
                  </div>

                  <div className="pt-1">
                    <div className="text-[10px] text-zinc-400 font-medium mb-1">
                      {language === 'bn' ? 'অনুমোদিত ডিলারশিপ:' : 'Authorized Dealerships:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {u.allowedAgencyIds?.includes('*') ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-mono text-[10px] font-bold">
                          {language === 'bn' ? 'সকল অনুমোদিত ডিলারশিপ' : 'All Authorized Dealerships'}
                        </span>
                      ) : (
                        (u.allowedAgencyIds || []).map((agencyId: string) => {
                          const agency = agencies.find((a) => a.id === agencyId)
                          return (
                            <span
                              key={agencyId}
                              className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-semibold"
                            >
                              {agency?.code || agencyId}
                            </span>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u.id, u.isActive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 ${
                        u.isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive
                        ? language === 'bn'
                          ? 'নিষ্ক্রিয় করুন'
                          : 'Deactivate Account'
                        : language === 'bn'
                        ? 'সক্রিয় করুন'
                        : 'Reactivate Account'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Backend Pagination Bar */}
            <Pagination
              currentPage={userPage}
              totalPages={paginatedUsers.totalPages}
              totalItems={paginatedUsers.total}
              pageSize={userPageSize}
              onPageChange={(newPage) => setUserPage(newPage)}
              onPageSizeChange={(newSize) => {
                setUserPageSize(newSize)
                setUserPage(1)
              }}
              isLoading={isUserPageLoading}
              itemName="system users"
            />
          </div>
        </div>
      )}

      {/* TAB 2: ROLE DEFINITIONS & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${getRoleBadge(
                      r.name
                    )}`}
                  >
                    {r.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {r.isSystem ? 'System Role' : 'Custom Defined'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {r.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {r.description || 'No description provided.'}
                </p>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Granted Permissions ({r.permissions.length}):
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                    {r.permissions.map((p: string) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[9px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex justify-between items-center">
                <span>Assigned Staff: <strong>{r.userCount || 0} users</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {userModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setUserModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-lg max-h-[90dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white shadow-sm shrink-0">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Add New Dealership Staff
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Create credentials and assign authorized dealership access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {userSuccess && (
              <div className="m-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shrink-0">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{userSuccess}</span>
              </div>
            )}

            {userError && (
              <div className="m-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Staff Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md. Kamal Hossain"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kamal@dealership.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Assigned Primary Role
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-semibold text-base sm:text-sm"
                  >
                    <option value={UserRole.STOREKEEPER}>Storekeeper (Warehouse & Depot Stock)</option>
                    <option value={UserRole.CASHIER}>Cashier (Counter POS & Due Collection)</option>
                    <option value={UserRole.AGENCY_MANAGER}>Agency Manager (Dealership Branch Manager)</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Admin (Cross-Dealership Owner)</option>
                  </select>
                </div>

                {/* Dealership Scoping */}
                <div className="space-y-2 pt-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Authorized Dealership Tenancy</span>
                    <span className="text-[10px] text-zinc-400">Select permitted agencies</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {agencies.map((agency) => {
                      const isChecked = selectedAgencyIds.includes(agency.id)

                      return (
                        <div
                          key={agency.id}
                          onClick={() => handleToggleAgencySelection(agency.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                            isChecked
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-red-600 focus:ring-red-500"
                          />
                          <div className="truncate">
                            <div className="font-bold text-xs">{agency.code}</div>
                            <div className="text-[10px] text-zinc-500 truncate">{agency.name}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isSubmittingUser ? 'Adding User...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CUSTOM ROLE */}
      {roleModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setRoleModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
        >
          <div className="w-full max-w-xl max-h-[90dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
            {/* Mobile swipe grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto my-2 sm:hidden shrink-0" />

            {/* Pinned Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:p-6 shrink-0 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    Create Custom Role
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Configure specialized job title and assign granular operational permissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-mono cursor-pointer shrink-0 ml-2"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {roleSuccess && (
              <div className="m-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shrink-0">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{roleSuccess}</span>
              </div>
            )}

            {roleError && (
              <div className="m-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{roleError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Role Code / Slug
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FLEET_AUDITOR"
                      value={roleSlug}
                      onChange={(e) => setRoleSlug(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono font-bold text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Display Role Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fleet Quality & Audit Inspector"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    Role Description & Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inspects warehouse stock, batch serials, and customer dispatch."
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-base sm:text-sm"
                  />
                </div>

                {/* Permissions Checklist */}
                <div className="space-y-2 pt-2">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Granular Operational Permissions</span>
                    <span className="text-[10px] text-zinc-400">
                      {selectedPermissions.length} selected
                    </span>
                  </label>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 max-h-52 overflow-y-auto space-y-2">
                    {PERMISSION_DEFINITIONS.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.key)

                      return (
                        <div
                          key={perm.key}
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                            isChecked
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span>{perm.label}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                {perm.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-800/90 backdrop-blur-xs shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold cursor-pointer text-center text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRole}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 text-center text-xs sm:text-sm"
                >
                  {isSubmittingRole ? 'Creating Role...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
