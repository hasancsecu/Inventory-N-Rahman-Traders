import { cookies } from 'next/headers'
import {
  AuthUser,
  AUTH_COOKIE_NAME,
} from './auth-types'

export * from './auth-types'

/**
 * Retrieves the currently logged-in user from the session cookie,
 * or returns null if unauthenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const rawSession = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession) as AuthUser
        if (parsed && parsed.id && parsed.email) {
          return parsed
        }
      } catch (e) {
        console.warn('Failed to parse auth cookie:', e)
      }
    }
  } catch (err) {
    // cookies() unavailable during prerender
  }

  return null
}
