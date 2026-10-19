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

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.warn(
      '⚠️ DATABASE_URL is not set. PrismaClient initialized with default settings.'
    )
    return new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    })
  }

  // Configure pg.Pool with serverless pool size constraints
  const pool =
    globalThis.pgPoolGlobal ??
    new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 10 : 5, // Serverless safe connection pool limit
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: connectionString.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.pgPoolGlobal = pool
  }

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

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma
