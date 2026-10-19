import { cookies } from 'next/headers'
import { UserRole } from '@prisma/client'
import {
  AuthUser,
  AUTH_COOKIE_NAME,
  ACTIVE_AGENCY_COOKIE,
  DEFAULT_ROLE_PERMISSIONS,
  userHasPermission,
  userCanAccessAgency,
} from './auth-types'

export * from './auth-types'

/**
 * Retrieves the currently logged-in user from the session cookie,
 * or defaults to demo Super Admin for seamless initial onboarding.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const cookieStore = await cookies()
    const rawSession = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession) as AuthUser
        return parsed
      } catch (e) {
        console.warn('Failed to parse auth cookie:', e)
      }
    }
  } catch (err) {
    // cookies() unavailable during prerender
  }

  // Default authenticated user (Super Admin / Owner)
  return {
    id: 'user-naim-superadmin',
    name: 'Naimur Rahman (Proprietor)',
    email: 'naim@lubricants-bd.com',
    role: UserRole.SUPER_ADMIN,
    roleTitle: 'Distributorship Owner & Super Admin',
    allowedAgencyIds: ['*'], // Full multi-dealership authority
    activeAgencyId: 'agency-caltex-01',
    permissions: ['*'],
  }
}
