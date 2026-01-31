import 'server-only'

import { revalidateTag } from 'next/cache'
import { createOrUpdateAccountFromSession } from '@/external/service/account.service'

type SessionUser = {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
}

type SessionInfo = {
  id: string
  userId: string
  expiresAt: Date
}

export async function createOrUpdateAccountFromSessionCommand(input: {
  user: SessionUser
  session: SessionInfo
}) {
  const account = await createOrUpdateAccountFromSession(input)
  if (account) {
    revalidateTag('account')
  }
  return account
}
