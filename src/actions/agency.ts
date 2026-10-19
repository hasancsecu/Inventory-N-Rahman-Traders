'use server'

import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getStoredAgencies, getStoredAgencyById } from '@/lib/backend-store'
import { getDbAgencyById } from '@/lib/db-service'

const ACTIVE_AGENCY_COOKIE = 'lubricant_active_agency_id'

export interface AgencySummary {
  id: string
  name: string
  code: string
  brandPrincipal: string
  tradeLicense: string
  binNo: string
  phone: string
  address: string
  district?: string
  brandColor: string
  bankName?: string | null
  bankAccountName?: string | null
  bankAccountNo?: string | null
  bankBranch?: string | null
  bankRoutingNo?: string | null
}

/**
 * Retrieves the currently active Agency based on cookies or defaults to the first active agency.
 */
export async function getActiveAgency(): Promise<AgencySummary | null> {
  let savedAgencyId: string | undefined
  try {
    const cookieStore = await cookies()
    savedAgencyId = cookieStore.get(ACTIVE_AGENCY_COOKIE)?.value
  } catch {}

  // 1. Try Prisma DB if reachable
  try {
    if (savedAgencyId) {
      const agency = await prisma.agency.findUnique({
        where: { id: savedAgencyId, isActive: true },
      })
      if (agency) return agency as AgencySummary
    }

    const firstAgency = await prisma.agency.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })
    if (firstAgency) return firstAgency as AgencySummary
  } catch {}

  // 2. Persistent Backend Store
  const storedAgencies = getStoredAgencies()
  if (savedAgencyId) {
    const matched = storedAgencies.find((a) => a.id === savedAgencyId)
    if (matched) return { ...matched, brandColor: matched.brandColor || '#D92D20' }
  }

  if (storedAgencies.length > 0) {
    return { ...storedAgencies[0], brandColor: storedAgencies[0].brandColor || '#D92D20' }
  }

  return null
}

/**
 * Returns all active agencies available for selection
 */
export async function getAllAgencies(): Promise<AgencySummary[]> {
  // 1. Try Prisma DB
  try {
    const agencies = await prisma.agency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    })
    if (agencies.length > 0) return agencies as AgencySummary[]
  } catch {}

  // 2. Persistent Backend Store
  return getStoredAgencies().map((a) => ({
    ...a,
    brandColor: a.brandColor || '#D92D20',
  }))
}

/**
 * Switches the active agency in the session cookie and revalidates all paths
 */
export async function switchActiveAgency(agencyId: string) {
  // Verify agency exists in database or backend
  const agency = (await getDbAgencyById(agencyId)) || getStoredAgencyById(agencyId)
  if (!agency) {
    return { success: false, error: 'Agency not found.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_AGENCY_COOKIE, agencyId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  revalidatePath('/')
  return { success: true, agencyId }
}
