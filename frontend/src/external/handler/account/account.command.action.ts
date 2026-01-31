'use server'

import { withAuth } from '@/features/auth/servers/auth.guard'
import { createOrUpdateAccountFromSessionCommand } from './account.command.server'

export const refreshMyAccountCommandAction = withAuth(async (_input, ctx) => {
  return createOrUpdateAccountFromSessionCommand({
    user: ctx.session.user,
    session: ctx.session.session,
  })
})
