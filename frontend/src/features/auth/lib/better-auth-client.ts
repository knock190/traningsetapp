import { createAuthClient } from 'better-auth/react'
import { customSessionClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth`
    : '/api/auth',
  plugins: [customSessionClient()],
})
