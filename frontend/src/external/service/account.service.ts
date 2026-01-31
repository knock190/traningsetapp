import { desc, eq } from 'drizzle-orm'
import { db } from '../client/db'
import { account, session, user } from '../db/schema'
import type { AccountDto } from '../dto/account.dto'

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

function splitName(fullName?: string | null) {
  const safeName = fullName?.trim() ?? ''
  if (!safeName) {
    return { firstName: '', lastName: '' }
  }
  const [firstName, ...rest] = safeName.split(' ')
  return {
    firstName: firstName ?? '',
    lastName: rest.join(' '),
  }
}

function toAccountDto(input: {
  userRecord: typeof user.$inferSelect
  accountRecord?: typeof account.$inferSelect | null
  lastLoginAt?: Date | null
}): AccountDto {
  const { firstName, lastName } = splitName(input.userRecord.name)
  return {
    id: input.userRecord.id,
    email: input.userRecord.email,
    firstName,
    lastName,
    provider: input.accountRecord?.providerId ?? null,
    providerAccountId: input.accountRecord?.accountId ?? null,
    thumbnail: input.userRecord.image ?? null,
    lastLoginAt: input.lastLoginAt ? input.lastLoginAt.toISOString() : null,
  }
}

export async function getAccountByUserId(userId: string): Promise<AccountDto | null> {
  const [userRecord] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!userRecord) {
    return null
  }

  const [accountRecord] = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId))
    .limit(1)

  const [lastSession] = await db
    .select()
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.createdAt))
    .limit(1)

  return toAccountDto({
    userRecord,
    accountRecord,
    lastLoginAt: lastSession?.createdAt ?? userRecord.updatedAt,
  })
}

export async function getAccountByEmail(email: string): Promise<AccountDto | null> {
  const normalizedEmail = email.trim().toLowerCase()
  const [userRecord] = await db
    .select()
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1)

  if (!userRecord) {
    return null
  }

  return getAccountByUserId(userRecord.id)
}

export async function createOrUpdateAccountFromSession(input: {
  user: SessionUser
  session: SessionInfo
}): Promise<AccountDto | null> {
  if (!input.user.email) {
    return null
  }

  const now = new Date()
  const normalizedEmail = input.user.email.trim().toLowerCase()

  await db.transaction(async (tx) => {
    const [existingUser] = await tx
      .select()
      .from(user)
      .where(eq(user.id, input.user.id))
      .limit(1)

    if (existingUser) {
      await tx
        .update(user)
        .set({
          name: input.user.name ?? existingUser.name,
          email: normalizedEmail,
          image: input.user.image ?? existingUser.image,
          updatedAt: now,
        })
        .where(eq(user.id, input.user.id))
    } else {
      await tx.insert(user).values({
        id: input.user.id,
        name: input.user.name ?? '',
        email: normalizedEmail,
        emailVerified: true,
        image: input.user.image ?? null,
        createdAt: now,
        updatedAt: now,
      })
    }

    const [existingAccount] = await tx
      .select()
      .from(account)
      .where(eq(account.userId, input.user.id))
      .limit(1)

    if (existingAccount) {
      await tx
        .update(account)
        .set({
          updatedAt: now,
        })
        .where(eq(account.id, existingAccount.id))
    }
  })

  return getAccountByUserId(input.user.id)
}

