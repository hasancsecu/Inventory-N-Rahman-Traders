import { getCurrentUser } from '@/lib/auth'
import { getDbUsers } from '@/lib/db-service'
import { redirect } from 'next/navigation'
import { LoginClient } from './login-client'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/')
  }

  const users = await getDbUsers()

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-8">
      <LoginClient currentUser={user} availableUsers={users} />
    </div>
  )
}
