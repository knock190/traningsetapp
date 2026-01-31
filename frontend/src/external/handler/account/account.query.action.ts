'use server'

import { withAuth } from '@/features/auth/servers/auth.guard'
import { getAccountByEmailQuery, getAccountByUserIdQuery } from './account.query.server'

export const getMyAccountQueryAction = withAuth(async (_input, ctx) => {
  return getAccountByUserIdQuery(ctx.session.user.id)
})

export const getAccountByEmailQueryAction = withAuth(async (input: { email: string }) => {
  return getAccountByEmailQuery(input.email)
})
