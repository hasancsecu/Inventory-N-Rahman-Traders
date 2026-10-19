import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seeding initial Super Admin for LubriFlow ERP...')

  // 1. Ensure system roles exist
  const roles = [
    {
      name: 'SUPER_ADMIN',
      title: 'Super Admin (Proprietor)',
      description: 'Full unconstrained administrative, multi-agency and financial authority',
      permissions: ['*'],
      isSystem: true,
    },
    {
      name: 'AGENCY_MANAGER',
      title: 'Agency Manager',
      description: 'Full operational authority over assigned dealership agencies',
      permissions: [
        'pos:create_invoice',
        'pos:override_credit',
        'inventory:view',
        'inventory:decant',
        'khata:view',
        'khata:collect_due',
        'analytics:view',
        'agency:cross_switch',
      ],
      isSystem: true,
    },
    {
      name: 'STOREKEEPER',
      title: 'Depot Storekeeper & Decanter',
      description: 'Physical inventory, batch receipts, and decanting logs',
      permissions: [
        'inventory:view',
        'inventory:decant',
        'inventory:adjust',
      ],
      isSystem: true,
    },
    {
      name: 'CASHIER',
      title: 'Billing Cashier & Due Collector',
      description: 'POS invoice generation and customer due collection',
      permissions: [
        'pos:create_invoice',
        'khata:view',
        'khata:collect_due',
      ],
      isSystem: true,
    },
  ]

  for (const r of roles) {
    await prisma.roleDefinition.upsert({
      where: { name: r.name },
      update: {
        title: r.title,
        description: r.description,
        permissions: r.permissions,
      },
      create: r,
    })
  }

  // 2. Initial Super Admin user ONLY (no demo agencies, products, suppliers, customers, or staff)
  const superAdminRole = await prisma.roleDefinition.findUnique({
    where: { name: 'SUPER_ADMIN' },
  })

  const adminEmail = process.env.SUPERADMIN_EMAIL || 'admin@nrahmantraders.com'
  const adminName = process.env.SUPERADMIN_NAME || 'Abu Tamanna Hasan (Proprietor)'

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: UserRole.SUPER_ADMIN,
      customRoleId: superAdminRole?.id,
      isActive: true,
    },
    create: {
      id: 'usr-super-admin',
      name: adminName,
      email: adminEmail,
      role: UserRole.SUPER_ADMIN,
      customRoleId: superAdminRole?.id,
      isActive: true,
    },
  })

  console.log(`✅ Super Admin created successfully: ${adminEmail}`)
  console.log('✨ Zero demo/seed data seeded. Agencies, products, customers & staff will be created by Super Admin.')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
