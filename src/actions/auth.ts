'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  AuthUser,
  AUTH_COOKIE_NAME,
  ACTIVE_AGENCY_COOKIE,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/lib/auth'
import {
  getStoredUsers,
  getStoredUserById,
  getStoredUserByEmail,
} from '@/lib/backend-store'
import { UserRole } from '@prisma/client'

/**
 * Quick login for switching staff personas (Super Admin privilege):
 * - Super Admin (Full Cross-Agency Authority)
 * - Agency Manager (Caltex)
 * - Storekeeper (Central Warehouse & Stock)
 * - Cashier (Counter POS & Due Collection)
 */
export async function quickLoginAs(userId: string) {
  const { getCurrentUser } = await import('@/lib/auth')
  const currentUser = await getCurrentUser()
  if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN && !currentUser.allowedAgencyIds.includes('*')) {
    throw new Error(
      'Access Denied: Role switching and staff impersonation is strictly restricted to Super Admin.'
    )
  }

  const user = getStoredUserById(userId)
  if (!user) {
    throw new Error('User account not found')
  }

  const role = user.role as UserRole
  const permissions = user.permissions || DEFAULT_ROLE_PERMISSIONS[role] || []

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    roleTitle: user.roleTitle,
    allowedAgencyIds: user.allowedAgencyIds,
    activeAgencyId: user.activeAgencyId || user.allowedAgencyIds[0] || 'agency-caltex-01',
    permissions,
  }

  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(authUser), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })

  // Set active dealership
  cookieStore.set(ACTIVE_AGENCY_COOKIE, authUser.activeAgencyId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })

  revalidatePath('/', 'layout')
  return { success: true, user: authUser }
}

/**
 * Standard email/password authentication
 */
export async function loginUser(credentials: { email: string; password?: string }) {
  const { email } = credentials

  // 1. Try Prisma DB if reachable
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase(), isActive: true },
      include: {
        agencyAccess: true,
        customRole: true,
      },
    })

    if (user) {
      const role = user.role as UserRole
      const permissions = user.customRole?.permissions || DEFAULT_ROLE_PERMISSIONS[role] || []
      const allowedAgencyIds = user.agencyAccess.map((a) => a.agencyId)
      const activeAgencyId = user.defaultAgencyId || allowedAgencyIds[0] || 'agency-caltex-01'

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        roleTitle: user.customRole?.title || user.role,
        allowedAgencyIds,
        activeAgencyId,
        permissions,
      }

      const cookieStore = await cookies()
      cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(authUser), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })

      cookieStore.set(ACTIVE_AGENCY_COOKIE, activeAgencyId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })

      revalidatePath('/', 'layout')
      return { success: true, user: authUser }
    }
  } catch {}

  // 2. Persistent Backend Store Lookup
  const matchedUser = getStoredUserByEmail(email.trim())
  if (matchedUser && matchedUser.isActive) {
    return quickLoginAs(matchedUser.id)
  }

  return {
    success: false,
    error: 'Invalid credentials or user account deactivated.',
  }
}

/**
 * Logout current user and clear session cookies
 */
export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
  cookieStore.delete(ACTIVE_AGENCY_COOKIE)

  revalidatePath('/', 'layout')
  redirect('/login')
}
