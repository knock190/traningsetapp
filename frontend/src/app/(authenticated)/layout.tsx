import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import { AuthenticatedLayoutWrapper } from '@/shared/components/layout/server/AuthenticatedLayoutWrapper'

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await requireAuthServer()

  return (
    <AuthenticatedLayoutWrapper userName={session.user.name ?? 'User'}>
      {children}
    </AuthenticatedLayoutWrapper>
  )
}
