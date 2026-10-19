# 🚀 Vercel Deployment & PostgreSQL Database Guide

This application is built with **Next.js 16 (App Router)** and **Prisma ORM (v5.22)** configured with serverless connection pooling via `@prisma/adapter-pg` and `pg.Pool`, specifically engineered for **Vercel Serverless Functions** and **PostgreSQL** (Neon, Supabase, Vercel Postgres, Railway, etc.).

---

## 🗄️ PostgreSQL Architecture

1. **Connection Pooling for Serverless**:
   - Uses `PrismaPg` driver adapter with connection pooling (`pgbouncer=true`).
   - Limits pool concurrency per serverless container to avoid connection exhaustion.
   - Singleton client in `src/lib/prisma.ts` cached on `globalThis`.

2. **Unified Database Layer (`src/lib/db-service.ts`)**:
   - All server actions (`master-data.ts`, `purchases.ts`, `users.ts`, `invoice.ts`, `khata.ts`, `decanting.ts`) and server component pages (`/`, `/inventory`, `/pos`, `/khata`, `/admin/master-data`, `/admin/users`) execute queries directly against PostgreSQL.
   - Resilient build-time fallback ensures `next build` never fails during static evaluation if the remote database is initializing.

3. **Multi-Dealership Schemas**:
   - `Agency` (Multi-dealership tenancy: Caltex, Shell, Mobil, TotalEnergies)
   - `Product` & `InventoryBatch` (Dynamic Viscosity & Packaging catalogs, FIFO cost rates, UOM)
   - `Customer` & `CustomerLedger` (Credit limits, running balances, money receipts)
   - `Supplier` & `PurchaseOrder` & `PurchaseOrderItem` (Inward stock additions, liabilities)
   - `Invoice` & `InvoiceItem` (Atomic POS transactions with stock decrement)
   - `BulkDecantingLog` (205L Drum to loose liter retail decanting)
   - `Brand`, `ViscosityMaster`, `PackagingMaster` (Custom dynamic catalogs)
   - `User`, `RoleDefinition`, `UserAgencyAccess` (Granular RBAC)

---

## 📦 Deploying to Vercel in 3 Steps

### Step 1: Push Database Schema to PostgreSQL

Obtain your PostgreSQL connection string from Neon, Supabase, Vercel Postgres, or Railway.

In your terminal or CI/CD environment, run:

```bash
# Push schema tables and indexes to your remote PostgreSQL instance
DATABASE_URL="your-postgresql-connection-string" npm run db:push
```

### Step 2: Seed Initial Dealership Data

Populate the database with all 4 Agencies (Caltex, Shell, Mobil, TotalEnergies), Super Admin / Storekeeper / Cashier users, lubricant products, batches, customers, and suppliers:

```bash
DATABASE_URL="your-postgresql-connection-string" npm run db:seed
```

### Step 3: Deploy to Vercel

1. Import your repository into **Vercel** (`https://vercel.com`).
2. Add the following **Environment Variables** in the Vercel project settings:
   - `DATABASE_URL`: `postgresql://user:password@host/database?sslmode=require&pgbouncer=true`
   - `DIRECT_URL`: `postgresql://user:password@host/database?sslmode=require` (optional, for migrations)
   - `NEXTAUTH_SECRET`: Any random 32+ character string
3. Click **Deploy**.

Vercel will execute:
```bash
npm install # Triggers postinstall: "prisma generate"
npm run build # Runs "prisma generate && next build"
```

Everything will build and deploy seamlessly with 0 configuration.

---

## 🛠️ Local Development & Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Generate Prisma client and create optimized production build |
| `npm run db:push` | Push schema changes directly to PostgreSQL (`prisma db push`) |
| `npm run db:seed` | Seed initial master data into PostgreSQL (`prisma db seed`) |
| `npm run db:studio` | Launch visual Prisma Studio database GUI (`localhost:5555`) |
