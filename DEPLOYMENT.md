# 🚀 Vercel Deployment & Database Connection Guide
**Project:** [inventory-n-rahman-traders](https://vercel.com/hasancsecus-projects/inventory-n-rahman-traders)  
**Stack:** Next.js 16 (Turbopack) • Prisma ORM 8 (`prisma@latest` & `@prisma/orm-postgres`) • PostgreSQL (Neon / Supabase / Vercel Postgres / Prisma Postgres)

---

## ❓ Why was data not saving previously?

1. **Missing or Placeholder Connection String:** In serverless platforms like Vercel, if `DATABASE_URL` is missing or contains placeholder demo credentials (`demo_secret`), the application falls back to an **in-memory store**.
2. **Ephemeral Serverless Memory:** Vercel serverless functions spin down and restart across requests. Any data kept in memory is wiped on container recycling.
3. **Missing Schema Synchronization:** Even if a database URL was provided, PostgreSQL begins with **0 tables**. Tables must be pushed via `prisma db push` to exist in the database.

---

## ⚡ What was fixed in the codebase?

1. **Automated Schema Initialization (`scripts/db-prepare.js`):**
   - Whenever Vercel builds your app (`npm run build`), it checks if a valid PostgreSQL connection URL is present.
   - If present, it **automatically runs `prisma db push` and `prisma/seed.ts`**.
   - You **do not** need to run any manual migrations or terminal commands against your remote database!
2. **Multi-Environment Variable Support:**
   - Automatically supports `DATABASE_URL`, `POSTGRES_PRISMA_URL`, and `POSTGRES_URL` (injected automatically when using Vercel Storage).
3. **Universal SSL Handshake:**
   - Serverless connection pool in `src/lib/prisma.ts` handles SSL certificates seamlessly across Neon, Supabase, Vercel Postgres, AWS, and Railway.
4. **Real-time Diagnostic Endpoint:**
   - Test your database connection live anytime at:  
     `https://your-domain.vercel.app/api/health/db`

---

## 🛠️ Step-by-Step: Connect Database on Vercel

Choose **Option A** (easiest, built into Vercel) or **Option B** (Neon.tech direct):

---

### Option A: Using Vercel Postgres (Easiest — 1 Click, Free)

1. Open your Vercel Project Dashboard:  
   👉 [https://vercel.com/hasancsecus-projects/inventory-n-rahman-traders](https://vercel.com/hasancsecus-projects/inventory-n-rahman-traders)
2. Click on the **Storage** tab at the top.
3. Click **Create Database** (or **Connect Database**).
4. Select **Postgres** (powered by Neon).
5. Choose a region (e.g. `Singapore (sin1)` for low latency to Bangladesh).
6. Click **Create & Continue** and accept the defaults.
7. Click **Connect to Project** and select `inventory-n-rahman-traders`.
   > *Vercel will automatically inject `DATABASE_URL`, `POSTGRES_URL`, and `POSTGRES_PRISMA_URL` into your project!*
8. Go to the **Deployments** tab on Vercel, click the three dots (`...`) on your latest deployment, and click **Redeploy**.
9. The build script will automatically detect the database, create all tables, and seed the Super Admin account!

---

### Option B: Using Neon.tech Directly (Recommended Free Serverless Postgres)

1. Go to [https://neon.tech](https://neon.tech) and create a free account.
2. Click **New Project** and name it `lubriflow-inventory`.
3. Choose region: `Asia Pacific (Singapore) - ap-southeast-1`.
4. In your Neon Project Dashboard, copy the **Connection details**:
   - Toggle **Pooled connection** (recommended for serverless)
   - Copy the connection string. It will look like:
     ```
     postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-fog-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
5. Go to your Vercel Project Settings:  
   👉 [https://vercel.com/hasancsecus-projects/inventory-n-rahman-traders/settings/environment-variables](https://vercel.com/hasancsecus-projects/inventory-n-rahman-traders/settings/environment-variables)
6. Add the following **Environment Variables**:

| Variable Name | Value | Environments |
|---|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-fog-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `super-secret-lubricant-erp-jwt-session-key-bangladesh-2026` | Production, Preview, Development |

7. Go to the **Deployments** tab, click `...` on the latest deployment, and click **Redeploy**.
8. Done! All tables are generated, and data will persist permanently.

---

### Option C: Using Supabase (https://supabase.com)

1. Create a project on Supabase in Singapore (`ap-southeast-1`).
2. In **Project Settings** > **Database** > **Connection string** > **URI**:
   - Copy the URI with your password.
3. In Vercel Settings > Environment Variables, add `DATABASE_URL`.
4. Redeploy your project.

---

## 🔍 How to Verify Database Persistence

1. Open in your browser:  
   `https://<your-vercel-domain>/api/health/db`
2. You will see a JSON status report:
   ```json
   {
     "status": "CONNECTED",
     "storageMode": "POSTGRESQL_PERMANENT",
     "tablesExist": true,
     "counts": {
       "agencies": 4,
       "products": 22,
       "users": 1,
       "customers": 10
     },
     "message": "✅ PostgreSQL is active and operational. All records will persist permanently."
   }
   ```
3. In the ERP Header, click the user profile icon and select **Database Status** (ডাটাবেজ সংযোগ স্থিতি) to inspect connection health anytime.

---

## 🔑 Initial Super Admin Login

Once deployed and connected:

- **Email:** `admin@nrahmantraders.com`
- **Role:** Super Admin (Proprietor)
- **Authority:** Full governance across all agencies (Caltex, Mobil, Shell, TotalEnergies), master data creation, product catalogs, customer khata, staff users, and POS billing.
- **Quick Demo Login:** You can also click the "Super Admin" role card on the `/login` page to sign in immediately.
