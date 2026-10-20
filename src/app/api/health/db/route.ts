import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPostgresConfigured } from '@/lib/db-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const isConfigured = isPostgresConfigured()
  const rawUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL

  const sourceVar = process.env.DATABASE_URL
    ? 'DATABASE_URL'
    : process.env.POSTGRES_PRISMA_URL
    ? 'POSTGRES_PRISMA_URL'
    : process.env.POSTGRES_URL
    ? 'POSTGRES_URL'
    : 'NONE'

  if (!isConfigured || !rawUrl) {
    return NextResponse.json(
      {
        status: 'DISCONNECTED',
        storageMode: 'EPHEMERAL_IN_MEMORY',
        message:
          'PostgreSQL is not connected. Data is currently saving to temporary memory and will reset on serverless restart.',
        source: sourceVar,
        reason: rawUrl?.includes('demo_secret')
          ? 'DATABASE_URL is set to a placeholder demo string with "demo_secret".'
          : 'No database connection string environment variable found.',
        actionRequired: [
          '1. Go to your Vercel Project: https://vercel.com/hasancsecus-projects/inventory-n-rahman-traders',
          '2. Click "Storage" tab > "Connect Database" > Select "Postgres" (Neon), OR click "Settings" > "Environment Variables"',
          '3. Add DATABASE_URL with your PostgreSQL connection URL',
          '4. Click "Deployments" > Click the latest deployment > Click "Redeploy"',
          '5. LubriFlow ERP will automatically push all tables and seed the Super Admin!',
        ],
      },
      { status: 200 }
    )
  }

  // Mask host for security
  let maskedHost = 'unknown'
  try {
    const urlObj = new URL(rawUrl.replace(/^postgresql:\/\//, 'http://'))
    maskedHost = urlObj.host
  } catch {}

  try {
    // 1. Test basic connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`

    // 2. Query record counts across master tables
    const [
      agencyCount,
      productCount,
      batchCount,
      userCount,
      customerCount,
      invoiceCount,
      supplierCount,
    ] = await Promise.all([
      prisma.agency.count().catch(() => -1),
      prisma.product.count().catch(() => -1),
      prisma.inventoryBatch.count().catch(() => -1),
      prisma.user.count().catch(() => -1),
      prisma.customer.count().catch(() => -1),
      prisma.invoice.count().catch(() => -1),
      prisma.supplier.count().catch(() => -1),
    ])

    const tablesExist = agencyCount !== -1

    return NextResponse.json({
      status: 'CONNECTED',
      storageMode: 'POSTGRESQL_PERMANENT',
      databaseHost: maskedHost,
      sourceVariable: sourceVar,
      tablesExist,
      counts: {
        agencies: agencyCount,
        products: productCount,
        batches: batchCount,
        users: userCount,
        customers: customerCount,
        invoices: invoiceCount,
        suppliers: supplierCount,
      },
      message: tablesExist
        ? '✅ PostgreSQL is active and operational. All records will persist permanently.'
        : '⚠️ Database connected, but tables have not been created yet. Redeploy on Vercel to auto-sync tables.',
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'CONNECTION_ERROR',
        storageMode: 'EPHEMERAL_IN_MEMORY_FALLBACK',
        databaseHost: maskedHost,
        sourceVariable: sourceVar,
        error: err?.message || 'Failed to connect to PostgreSQL',
        tip: 'Check that your database credentials are valid and that incoming connections (0.0.0.0/0) are allowed on your database provider.',
      },
      { status: 200 }
    )
  }
}
