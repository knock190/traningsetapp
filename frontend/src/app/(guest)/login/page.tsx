import { LoginForm } from '@/features/auth/components/client/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">筋トレセット数</h1>
        <LoginForm />
      </div>
    </div>
  )
}
