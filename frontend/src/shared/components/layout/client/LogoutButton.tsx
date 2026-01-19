'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/features/auth/lib/better-auth-client'
import { Button } from '@/shared/components/ui/Button'

export function LogoutButton({ userName }: { userName: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3 text-sm text-neutral-500">
      <span>{userName}</span>
      <Button variant="ghost" onClick={handleLogout}>
        ログアウト
      </Button>
    </div>
  )
}
