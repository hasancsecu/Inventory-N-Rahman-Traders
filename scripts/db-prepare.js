/**
 * Automated Database Preparation Script for Vercel & Production Deployments
 *
 * This script runs during `npm run build` BEFORE Next.js static page generation.
 * If a valid PostgreSQL connection string is detected:
 * 1. Synchronizes Prisma schema tables with PostgreSQL (`prisma db push`)
 * 2. Seeds initial system roles & Super Admin account (`prisma/seed.ts`)
 *
 * If no remote database is configured or demo secret is present:
 * Logs clear setup instructions without failing the build.
 */

const { execSync } = require('child_process')

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL
  )
}

async function prepareDatabase() {
  console.log('\n============================================================')
  console.log('🔍 [LUBRIFLOW ERP] Checking PostgreSQL Database Deployment...')
  console.log('============================================================')

  const dbUrl = getDatabaseUrl()

  if (!dbUrl) {
    console.warn('⚠️ [db-prepare] No DATABASE_URL or POSTGRES_PRISMA_URL detected in environment.')
    console.warn('⚠️ [db-prepare] The application will build with in-memory fallback.')
    console.warn('💡 [db-prepare] To enable permanent data persistence:')
    console.warn('   1. Go to Vercel Project Settings > Environment Variables')
    console.warn('   2. Add DATABASE_URL="postgresql://user:password@host/db?sslmode=require"')
    console.warn('   3. Redeploy your project.')
    console.log('============================================================\n')
    return
  }

  if (dbUrl.includes('demo_secret') || dbUrl.includes('example.com')) {
    console.warn('⚠️ [db-prepare] DATABASE_URL is set to a placeholder/demo secret.')
    console.warn('⚠️ [db-prepare] Skipping remote database synchronization.')
    console.warn('💡 [db-prepare] Replace with your real Neon / Supabase / Vercel Postgres connection string.')
    console.log('============================================================\n')
    return
  }

  // Set DATABASE_URL for Prisma CLI if it came from POSTGRES_PRISMA_URL
  process.env.DATABASE_URL = dbUrl

  try {
    // Mask sensitive credentials for safe logging in Vercel build logs
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')
    console.log(`🔌 [db-prepare] Connecting to PostgreSQL instance: ${maskedUrl}`)

    console.log('📦 [db-prepare] Synchronizing database tables (prisma db push)...')
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl },
    })
    console.log('✅ [db-prepare] Database tables and indexes synchronized successfully!')

    console.log('🌱 [db-prepare] Verifying Super Admin and System Roles (seed)...')
    execSync('npx tsx prisma/seed.ts', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl },
    })
    console.log('✅ [db-prepare] Super Admin & System Roles verified.')
    console.log('============================================================\n')
  } catch (err) {
    console.error('⚠️ [db-prepare] Database sync warning (will continue build):', err.message || err)
    console.warn('💡 [db-prepare] Ensure your database credentials and network access (0.0.0.0/0) are open for Vercel.')
    console.log('============================================================\n')
  }
}

prepareDatabase()
