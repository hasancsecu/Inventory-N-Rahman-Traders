import { UserRole } from '@prisma/client'

export const AUTH_COOKIE_NAME = 'lubricant_auth_user'
export const ACTIVE_AGENCY_COOKIE = 'lubricant_active_agency_id'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  roleTitle: string
  customRoleId?: string | null
  allowedAgencyIds: string[] // ['*'] for SUPER_ADMIN or specific agency IDs
  activeAgencyId: string
  permissions: string[]
}

export const PERMISSION_DEFINITIONS = [
  {
    key: 'pos:create_invoice',
    label: 'Generate POS Invoices & Chalans',
    category: 'Sales & POS',
    description: 'Allows issuing commercial invoices and delivery chalans.',
  },
  {
    key: 'pos:override_credit',
    label: 'Authorize Credit Limit Override',
    category: 'Sales & POS',
    description: 'Approve invoice generation when customer due exceeds approved credit limit.',
  },
  {
    key: 'inventory:view',
    label: 'View Depoted Stock',
    category: 'Inventory',
    description: 'View batch inventory, SKU details, and low-stock reorder alerts.',
  },
  {
    key: 'inventory:decant',
    label: 'Manage Inventory Batches',
    category: 'Inventory',
    description: 'Manage warehouse batch allocation, serial numbers, and stock receipts.',
  },
  {
    key: 'inventory:adjust',
    label: 'Adjust Batch Stock',
    category: 'Inventory',
    description: 'Modify inventory quantities and batch valuations.',
  },
  {
    key: 'khata:view',
    label: 'View Customer Khata Ledgers',
    category: 'Finance & Khata',
    description: 'View customer statement ledgers and aggregate credit limits.',
  },
  {
    key: 'khata:collect_due',
    label: 'Collect Due Payments',
    category: 'Finance & Khata',
    description: 'Record cash, bank, or bKash collections and issue money receipts.',
  },
  {
    key: 'analytics:view',
    label: 'View Principal Quotas & FIFO Margins',
    category: 'Executive & Reports',
    description: 'Access lifting target performance, volume in liters, and gross profit.',
  },
  {
    key: 'agency:cross_switch',
    label: 'Cross-Dealership Switcher',
    category: 'Multi-Entity',
    description: 'Switch between multiple agencies.',
  },
  {
    key: 'admin:manage_users',
    label: 'Manage Users & Roles',
    category: 'Administration',
    description: 'Create, update, and assign roles and dealership access to staff.',
  },
  {
    key: 'admin:manage_agencies',
    label: 'Manage Dealership Profile & Bank Details',
    category: 'Administration',
    description: 'Configure Trade License, BIN, TIN, and authorized bank accounts.',
  },
]

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'],
  AGENCY_MANAGER: [
    'pos:create_invoice',
    'pos:override_credit',
    'inventory:view',
    'inventory:decant',
    'khata:view',
    'khata:collect_due',
    'analytics:view',
    'agency:cross_switch',
  ],
  STOREKEEPER: [
    'inventory:view',
    'inventory:decant',
    'inventory:adjust',
  ],
  CASHIER: [
    'pos:create_invoice',
    'khata:view',
    'khata:collect_due',
  ],
}

export function userHasPermission(user: AuthUser, permission: string): boolean {
  if (user.role === UserRole.SUPER_ADMIN) return true
  if (user.permissions.includes('*')) return true
  return user.permissions.includes(permission)
}

export function userCanAccessAgency(user: AuthUser, agencyId: string): boolean {
  if (user.role === UserRole.SUPER_ADMIN) return true
  if (user.allowedAgencyIds.includes('*')) return true
  return user.allowedAgencyIds.includes(agencyId)
}
