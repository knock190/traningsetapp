import 'server-only'

import { getAccountByEmail, getAccountByUserId } from '@/external/service/account.service'

export async function getAccountByEmailQuery(email: string) {
  return getAccountByEmail(email)
}

export async function getAccountByUserIdQuery(userId: string) {
  return getAccountByUserId(userId)
}
