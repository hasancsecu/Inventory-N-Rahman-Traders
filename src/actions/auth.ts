'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import crypto from 'node:crypto'
import {
  AuthUser,
  AUTH_COOKIE_NAME,
  ACTIVE_AGENCY_COOKIE,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/lib/auth'
import {
  getDbUserById,
  getDbUserByEmail,
} from '@/lib/db-service'
import { UserRole } from '@prisma/client'

/**
 * Standard password hashing using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  try {
    const [salt, key] = combinedHash.split(':')
    if (!salt || !key) return false
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'))
  } catch {
    return false
  }
}

async function setAuthCookies(authUser: AuthUser) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(authUser), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })

  cookieStore.set(ACTIVE_AGENCY_COOKIE, authUser.activeAgencyId || '', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
}

/**
 * Quick login for switching staff personas (Super Admin privilege only)
 */
export async function quickLoginAs(userId: string) {
  const { getCurrentUser } = await import('@/lib/auth')
  const currentUser = await getCurrentUser()
  if (!currentUser || (currentUser.role !== UserRole.SUPER_ADMIN && !currentUser.allowedAgencyIds.includes('*'))) {
    throw new Error(
      'Access Denied: Persona switching is strictly restricted to authenticated Super Admin.'
    )
  }

  const user = await getDbUserById(userId)
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
    activeAgencyId: user.activeAgencyId || user.allowedAgencyIds[0] || '',
    permissions,
  }

  await setAuthCookies(authUser)
  revalidatePath('/', 'layout')
  return { success: true, user: authUser }
}

/**
 * Standard email/password authentication
 */
export async function loginUser(credentials: { email: string; password?: string }) {
  const email = (credentials.email || '').trim().toLowerCase()
  const password = credentials.password || ''

  if (!email) {
    return { success: false, error: 'Email address is required.' }
  }

  // 1. Try Prisma DB if reachable
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        agencyAccess: true,
        customRole: true,
      },
    })

    if (user && user.isActive) {
      // Check password if set, or initialize on first login
      if (user.passwordHash) {
        const isValid = await verifyPassword(password, user.passwordHash)
        if (!isValid) {
          return { success: false, error: 'Invalid password. Please check your credentials.' }
        }
      } else if (password) {
        // Save initial password hash
        try {
          const newHash = await hashPassword(password)
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          })
        } catch {
          // ignore if update fails
        }
      }

      const role = user.role as UserRole
      const permissions = user.customRole?.permissions || DEFAULT_ROLE_PERMISSIONS[role] || []
      const allowedAgencyIds = user.agencyAccess.map((a) => a.agencyId)
      if (role === UserRole.SUPER_ADMIN && !allowedAgencyIds.includes('*')) {
        allowedAgencyIds.push('*')
      }
      const activeAgencyId = user.defaultAgencyId || allowedAgencyIds[0] || ''

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

      await setAuthCookies(authUser)
      revalidatePath('/', 'layout')
      return { success: true, user: authUser }
    }
  } catch (err: any) {
    console.warn('Prisma login error, trying fallback:', err?.message)
  }

  // 2. Fallback User Lookup
  const matchedUser = await getDbUserByEmail(email)
  if (matchedUser && matchedUser.isActive) {
    if (matchedUser.passwordHash) {
      const isValid = await verifyPassword(password, matchedUser.passwordHash)
      if (!isValid) {
        return { success: false, error: 'Invalid password. Please check your credentials.' }
      }
    } else if (password) {
      matchedUser.passwordHash = await hashPassword(password)
    }

    const role = matchedUser.role as UserRole
    const permissions = matchedUser.permissions || DEFAULT_ROLE_PERMISSIONS[role] || []

    const authUser: AuthUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role,
      roleTitle: matchedUser.roleTitle,
      allowedAgencyIds: matchedUser.allowedAgencyIds,
      activeAgencyId: matchedUser.activeAgencyId || matchedUser.allowedAgencyIds[0] || '',
      permissions,
    }

    await setAuthCookies(authUser)
    revalidatePath('/', 'layout')
    return { success: true, user: authUser }
  }

  return {
    success: false,
    error: 'Invalid email or password. Please verify your credentials.',
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

export interface ChangePasswordResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Self-service password change for any authenticated user
 * Validates current password, enforces minimum length on new password,
 * and ensures confirm password matches.
 */
export async function changeUserPassword(formData: {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}): Promise<ChangePasswordResult> {
  const { getCurrentUser } = await import('@/lib/auth')
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {
      success: false,
      error: 'অনুগ্রহ করে প্রথমে লগইন করুন (Please log in first).',
    }
  }

  const currentPassword = formData.currentPassword || ''
  const newPassword = (formData.newPassword || '').trim()
  const confirmPassword = (formData.confirmPassword || '').trim()

  if (!newPassword) {
    return {
      success: false,
      error: 'নতুন পাসওয়ার্ড প্রদান আবশ্যক (New password is required).',
    }
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters).',
    }
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না (Passwords do not match).',
    }
  }

  // 1. Fetch current password hash from database or local fallback
  let existingHash: string | null = null

  try {
    const userInDb = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, passwordHash: true },
    })
    if (userInDb && userInDb.passwordHash) {
      existingHash = userInDb.passwordHash
    }
  } catch (err: any) {
    console.warn('Prisma check password hash error:', err?.message)
  }

  if (!existingHash) {
    const fallbackUser = await getDbUserById(currentUser.id)
    if (fallbackUser?.passwordHash) {
      existingHash = fallbackUser.passwordHash
    }
  }

  // 2. If the user currently has a password hash set, verify currentPassword
  if (existingHash) {
    if (!currentPassword) {
      return {
        success: false,
        error: 'বর্তমান পাসওয়ার্ড প্রদান আবশ্যক (Current password is required).',
      }
    }

    const isCurrentValid = await verifyPassword(currentPassword, existingHash)
    if (!isCurrentValid) {
      return {
        success: false,
        error: 'বর্তমান পাসওয়ার্ড সঠিক নয় (Current password is incorrect).',
      }
    }
  }

  // 3. Hash the new password using PBKDF2
  const newHash = await hashPassword(newPassword)

  // 4. Update in Prisma DB if reachable
  try {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash: newHash },
    })
  } catch (err: any) {
    console.warn('Prisma update password failed, saving to local store:', err?.message)
  }

  // 5. Update in local store fallback
  const { saveStoredUser } = await import('@/lib/backend-store')
  const storedUser = await getDbUserById(currentUser.id)
  if (storedUser) {
    storedUser.passwordHash = newHash
    saveStoredUser(storedUser)
  }

  revalidatePath('/', 'layout')
  return {
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে (Password changed successfully).',
  }
}

