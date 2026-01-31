import 'server-only'

import { getSessionServer } from './auth.server'

export async function isAuthenticatedServer() {
  const session = await getSessionServer()
  return Boolean(session?.user?.id)
}
