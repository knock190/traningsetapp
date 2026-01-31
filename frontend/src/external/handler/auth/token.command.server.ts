import 'server-only'

import { verifyGoogleIdToken } from '@/external/service/auth/token-verification.service'

export async function verifyGoogleIdTokenCommand(idToken: string) {
  return verifyGoogleIdToken(idToken)
}
