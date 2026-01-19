import type { ReactNode } from 'react'
import { BottomNav } from '../client/BottomNav'
import { LogoutButton } from '../client/LogoutButton'

export function AuthenticatedLayoutWrapper({
  userName,
  children,
}: {
  userName: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">筋トレセット数</h1>
          <LogoutButton userName={userName} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
