import { z } from 'zod'

export const AccountDtoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  provider: z.string().nullable(),
  providerAccountId: z.string().nullable(),
  thumbnail: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
})

export type AccountDto = z.infer<typeof AccountDtoSchema>

