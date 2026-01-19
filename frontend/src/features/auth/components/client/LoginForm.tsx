'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/features/auth/lib/better-auth-client'
import { Button } from '@/shared/components/ui/Button'

export function LoginForm() {
  const router = useRouter()

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    })
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Button onClick={handleLogin}>Googleでログイン</Button>
      <p className="text-xs text-neutral-500">
        Googleアカウントでログインします。
      </p>
    </div>
  )
}
