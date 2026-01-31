import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { customSession } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { unstable_cache } from 'next/cache'
import { db } from '@/external/client/db'
import * as schema from '@/external/db/schema'
import { getAccountByEmailQuery } from '@/external/handler/account/account.query.server'
import { createOrUpdateAccountFromSessionCommand } from '@/external/handler/account/account.command.server'

const getAccountByEmailCached = unstable_cache(
  async (email: string) => getAccountByEmailQuery(email),
  ['account-by-email'],
  {
    revalidate: 60 * 5,
    tags: ['account'],
  }
)

export const auth = betterAuth({
  baseURL: process.env.NEXTAUTH_URL,
  secret: process.env.NEXTAUTH_SECRET ?? '',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  session: {
    storeSessionInDatabase: false,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  plugins: [
    nextCookies(),
    customSession(async ({ user, session }) => {
      let account = null

      if (user?.email) {
        account = await getAccountByEmailCached(user.email)
        if (!account) {
          account = await createOrUpdateAccountFromSessionCommand({ user, session })
        }
      }

      return {
        user,
        session,
        account,
      }
    }),
  ],
})
