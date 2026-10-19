import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { DashboardHeader } from '@/components/dashboard-header'
import { getActiveAgency, getAllAgencies } from '@/actions/agency'
import { getCurrentUser } from '@/lib/auth'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'LUBRIFLOW ERP • Multi-Dealership Lubricant Distributor System',
  description:
    'Production-grade multi-entity Inventory, Due Khata & Principal Lifting Management ERP for authorized Lubricants dealerships.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentAgency = await getActiveAgency()
  const agencies = await getAllAgencies()
  const currentUser = await getCurrentUser()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-red-500 selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DashboardHeader
            currentAgency={currentAgency}
            agencies={agencies}
            activeUser={currentUser}
          />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
