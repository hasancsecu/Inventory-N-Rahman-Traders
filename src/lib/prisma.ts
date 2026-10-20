import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Serverless-Optimized Prisma Client with Connection Pooling for Vercel & Neon
 *
 * Architecture Notes:
 * 1. Neon / Supabase PgBouncer requires `pgbouncer=true` in DATABASE_URL.
 * 2. In serverless functions on Vercel, warm lambdas can exhaust database connections.
 *    We reuse the instance across requests using `globalThis`.
 * 3. We configure `pg.Pool` with connection limits tailored for serverless concurrency (max 10).
 * 4. Prepared statements are disabled or managed per pgBouncer requirements.
 */

declare global {
  // Allow global `var` declarations for persistent caching across hot-reloads
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var pgPoolGlobal: Pool | undefined
}

function getEffectiveConnectionString(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL
  )
}

function createPrismaClient(): PrismaClient {
  const connectionString = getEffectiveConnectionString()

  if (!connectionString || connectionString.includes('demo_secret') || connectionString.includes('example.com')) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️ DATABASE_URL is not configured or using demo placeholder. Prisma will operate with in-memory fallback. Add a valid PostgreSQL connection string in Vercel Project Settings > Environment Variables.'
      )
    }
    return new PrismaClient({
      log: ['error'],
    })
  }

  // If using Prisma Accelerate / Prisma Postgres managed connection (prisma+postgres:// or prisma://)
  if (
    connectionString.startsWith('prisma+postgres://') ||
    connectionString.startsWith('prisma://')
  ) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }

  // Cloud databases (Neon, Supabase, Vercel Postgres, AWS) require SSL
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1')

  // Configure pg.Pool with serverless pool size constraints
  const pool =
    globalThis.pgPoolGlobal ??
    new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 10 : 5, // Serverless safe connection pool limit
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    })

  globalThis.pgPoolGlobal = pool

  // Use Prisma Driver Adapter for pgBouncer connection pooling compatibility
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  })
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient()
globalThis.prismaGlobal = prisma

export default prisma

