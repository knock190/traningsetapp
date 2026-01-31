import { LoginPageClient } from '@/features/auth/components/client/LoginPageClient/LoginPageClient'
import { LoginPageTemplate } from '@/features/auth/components/server/LoginPageTemplate/LoginPageTemplate'

export default function LoginPage() {
  return (
    <LoginPageTemplate>
      <LoginPageClient />
    </LoginPageTemplate>
  )
}
