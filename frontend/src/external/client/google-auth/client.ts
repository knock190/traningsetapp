import 'server-only'

export type GoogleTokenInfo = {
  aud: string
  sub: string
  email?: string
  email_verified?: string
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
}

export async function fetchGoogleTokenInfo(idToken: string): Promise<GoogleTokenInfo> {
  const url = new URL('https://oauth2.googleapis.com/tokeninfo')
  url.searchParams.set('id_token', idToken)

  const response = await fetch(url.toString(), { method: 'GET' })
  if (!response.ok) {
    throw new Error('Invalid Google ID token')
  }

  return (await response.json()) as GoogleTokenInfo
}

