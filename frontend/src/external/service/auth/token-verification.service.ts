import 'server-only'

import { fetchGoogleTokenInfo } from '@/external/client/google-auth/client'

export async function verifyGoogleIdToken(idToken: string) {
  const tokenInfo = await fetchGoogleTokenInfo(idToken)

  if (process.env.GOOGLE_CLIENT_ID && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google ID token audience mismatch')
  }

  return tokenInfo
}

