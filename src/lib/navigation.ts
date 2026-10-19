import { AuthUser, userHasPermission } from './auth-types'
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  BookOpenCheck,
  TrendingUp,
  Shield,
  Database,
  LucideIcon,
} from 'lucide-react'

export interface DynamicNavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  badgeVariant?: 'default' | 'gold' | 'red' | 'blue'
  requiredRole?: string[]
  requiredPermission?: string
  description?: string
}

export const ALL_NAV_ITEMS: DynamicNavItem[] = [
  {
    label: 'Executive Overview',
    href: '/',
    icon: LayoutDashboard,
    description: 'Consolidated dealership KPIs and activity',
  },
  {
    label: 'POS Invoicing',
    href: '/pos',
    icon: ShoppingCart,
    badge: 'Chalan Seq',
    requiredPermission: 'pos:create_invoice',
    description: 'Commercial invoice generation and billing',
  },
  {
    label: 'Inventory & Stock',
    href: '/inventory',
    icon: Boxes,
    badge: 'Batches',
    requiredPermission: 'inventory:view',
    description: 'Real-time stock levels, batches, and warehouse management',
  },
  {
    label: 'Khata & Due Collection',
    href: '/khata',
    icon: BookOpenCheck,
    badge: 'Ledgers',
    requiredPermission: 'khata:view',
    description: 'Customer credit limits and payment receipts',
  },
  {
    label: 'Principal Analytics',
    href: '/analytics',
    icon: TrendingUp,
    badge: 'Quotas',
    requiredPermission: 'analytics:view',
    description: 'Lifting targets and FIFO gross profit',
  },
  {
    label: 'Master Data CRUD',
    href: '/admin/master-data',
    icon: Database,
    badge: 'ALL CRUD',
    badgeVariant: 'gold',
    requiredRole: ['SUPER_ADMIN'],
    description: 'Super Admin master data operations across all entities',
  },
  {
    label: 'Roles & Staff',
    href: '/admin/users',
    icon: Shield,
    badge: 'RBAC',
    requiredRole: ['SUPER_ADMIN'],
    requiredPermission: 'admin:manage_users',
    description: 'User access governance and permissions',
  },
]

/**
 * Returns dynamic navigation items strictly tailored to the authenticated user's role and permissions
 */
export function getNavigationForUser(user: AuthUser): DynamicNavItem[] {
  if (user.role === 'SUPER_ADMIN') {
    return ALL_NAV_ITEMS
  }

  return ALL_NAV_ITEMS.filter((item) => {
    // If an item is restricted to specific roles (like SUPER_ADMIN only for Master Data)
    if (item.requiredRole && !item.requiredRole.includes(user.role)) {
      return false
    }

    // Role-specific defaults
    if (user.role === 'AGENCY_MANAGER') {
      return ['/', '/pos', '/inventory', '/khata', '/analytics'].includes(item.href)
    }

    if (user.role === 'STOREKEEPER') {
      return ['/', '/inventory', '/pos'].includes(item.href)
    }

    if (user.role === 'CASHIER') {
      return ['/', '/pos', '/khata', '/inventory'].includes(item.href)
    }

    // Custom roles: check permission
    if (item.requiredPermission) {
      return userHasPermission(user, item.requiredPermission)
    }

    return item.href === '/'
  })
}

/**
 * Checks if the user is authorized to switch roles or impersonate other staff
 */
export function canUserSwitchRole(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  return user.role === 'SUPER_ADMIN'
}

/**
 * Checks if user has Super Admin master data access
 */
export function canUserAccessMasterData(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  return user.role === 'SUPER_ADMIN'
}
