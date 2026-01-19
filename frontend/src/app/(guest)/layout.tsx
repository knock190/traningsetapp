import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getSessionServer } from '@/features/auth/servers/auth.server'

export default async function GuestLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getSessionServer()
  if (session) redirect('/')

  return <>{children}</>
}
