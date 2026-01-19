import { redirect } from 'next/navigation'
import { getSessionServer } from './auth.server'

export async function requireAuthServer() {
  const session = await getSessionServer()
  if (!session?.user?.id) {
    redirect('/login')
  }
  return session
}
