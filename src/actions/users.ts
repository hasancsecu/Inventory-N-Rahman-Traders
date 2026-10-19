'use server'

import { getCurrentUser } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  getDbUsers,
  getDbRoles,
  saveDbUser,
  saveDbRole,
  toggleDbUserStatus,
  getPaginatedDbUsers,
} from '@/lib/db-service'
import { StoredUser, StoredRole } from '@/lib/backend-store'

const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.nativeEnum(UserRole).default(UserRole.STOREKEEPER),
  customRoleId: z.string().optional(),
  agencyIds: z.array(z.string()).min(1, 'Select at least one dealership agency access'),
})

const CreateRoleSchema = z.object({
  name: z.string().min(2, 'Role slug must be at least 2 characters').toUpperCase(),
  title: z.string().min(3, 'Role title is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
})

/**
 * Fetch all users with their roles and dealership access
 */
export async function getUsersList() {
  const currentUser = await getCurrentUser()
  if (
    !currentUser ||
    (currentUser.role !== UserRole.SUPER_ADMIN &&
      !currentUser.permissions.includes('admin:manage_users') &&
      !currentUser.permissions.includes('*'))
  ) {
    throw new Error('Access Denied: Only Super Admin can manage users.')
  }

  return getDbUsers()
}

/**
 * Fetch available roles and permissions
 */
export async function getRolesList() {
  return getDbRoles()
}

/**
 * Create a new dealership staff user with assigned role & agency access
 */
export async function createNewUser(
  rawInput: z.infer<typeof CreateUserSchema>
): Promise<{ success: true; user: StoredUser } | { success: false; error: string }> {
  try {
    const currentUser = await getCurrentUser()
    if (
      !currentUser ||
      (currentUser.role !== UserRole.SUPER_ADMIN &&
        !currentUser.permissions.includes('admin:manage_users') &&
        !currentUser.permissions.includes('*'))
    ) {
      return { success: false, error: 'Access Denied: Only Super Admin can create users.' }
    }

    const { name, email, role, customRoleId, agencyIds } = CreateUserSchema.parse(rawInput)

    const roles = await getDbRoles()
    const roleObj = roles.find((r) => r.id === customRoleId || r.name === role)

    const newUser: StoredUser = {
      id: `user-${Date.now().toString().slice(-6)}`,
      name,
      email: email.toLowerCase(),
      role: role as any,
      roleTitle: roleObj?.title || role,
      allowedAgencyIds: agencyIds,
      activeAgencyId: agencyIds[0] || '',
      permissions: roleObj?.permissions || ['inventory:view'],
      isActive: true,
    }

    const saved = await saveDbUser(newUser)
    revalidatePath('/admin/users')
    return { success: true, user: saved }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create user.' }
  }
}

/**
 * Create a custom RBAC role with granular permissions
 */
export async function createNewRole(
  rawInput: z.infer<typeof CreateRoleSchema>
): Promise<{ success: true; role: StoredRole } | { success: false; error: string }> {
  try {
    const currentUser = await getCurrentUser()
    if (
      !currentUser ||
      (currentUser.role !== UserRole.SUPER_ADMIN &&
        !currentUser.permissions.includes('admin:manage_users') &&
        !currentUser.permissions.includes('*'))
    ) {
      return { success: false, error: 'Access Denied: Only Super Admin can create roles.' }
    }

    const { name, title, description, permissions } = CreateRoleSchema.parse(rawInput)

    const newRole: StoredRole = {
      id: `role-${Date.now().toString().slice(-6)}`,
      name: name.toUpperCase().replace(/\s+/g, '_'),
      title,
      description,
      permissions,
      isSystem: false,
      userCount: 0,
    }

    const saved = await saveDbRole(newRole)
    revalidatePath('/admin/users')
    return { success: true, role: saved }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create role.' }
  }
}

/**
 * Toggle user active/deactivated status
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
  const currentUser = await getCurrentUser()
  if (
    !currentUser ||
    (currentUser.role !== UserRole.SUPER_ADMIN &&
      !currentUser.permissions.includes('admin:manage_users') &&
      !currentUser.permissions.includes('*'))
  ) {
    throw new Error('Access Denied: Only Super Admin can change user status.')
  }

  const success = await toggleDbUserStatus(userId, isActive)
  revalidatePath('/admin/users')
  return { success }
}

export async function getPaginatedUsersAction(params: {
  page?: number
  pageSize?: number
  search?: string
  role?: string
}) {
  const currentUser = await getCurrentUser()
  if (
    !currentUser ||
    (currentUser.role !== UserRole.SUPER_ADMIN &&
      !currentUser.permissions.includes('admin:manage_users') &&
      !currentUser.permissions.includes('*'))
  ) {
    throw new Error('Access Denied: Only Super Admin can manage users.')
  }

  const data = await getPaginatedDbUsers({
    page: Number(params.page) || 1,
    pageSize: Number(params.pageSize) || 10,
    search: params.search,
    role: params.role,
  })

  return {
    success: true,
    data,
  }
}
