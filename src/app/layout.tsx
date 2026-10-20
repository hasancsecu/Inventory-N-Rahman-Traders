import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/context/language-context'
import { DashboardHeader } from '@/components/dashboard-header'
import { Toaster } from '@/components/ui/toast'
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
  title: 'লুব্রিফ্লো ইআরপি • LUBRIFLOW ERP • Multi-Dealership Lubricant Distributor System',
  description:
    'Production-grade multi-entity Inventory, Due Khata & Principal Lifting Management ERP for authorized Lubricants dealerships in Bangladesh.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentAgency = await getActiveAgency()
  const agencies = await getAllAgencies()
  const currentUser = await getCurrentUser()

  const cookieStore = await cookies()
  const langCookie = cookieStore.get('lubriflow_lang')?.value
  const initialLanguage = langCookie === 'en' ? 'en' : 'bn'

  return (
    <html
      lang={initialLanguage}
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
          <LanguageProvider initialLanguage={initialLanguage}>
            <DashboardHeader
              currentAgency={currentAgency}
              agencies={agencies}
              activeUser={currentUser}
            />
            <main className="flex-1 flex flex-col">{children}</main>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
