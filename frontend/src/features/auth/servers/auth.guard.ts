import { requireAuthServer } from './redirect.server'

type AuthSession = Awaited<ReturnType<typeof requireAuthServer>>

type WithAuthHandler<Input, Output> = (
  input: Input,
  ctx: {
    session: AuthSession
    accountId: string
  }
) => Promise<Output>

export function withAuth<Input, Output>(handler: WithAuthHandler<Input, Output>) {
  return async (input: Input): Promise<Output> => {
    const session = await requireAuthServer()
    const accountId = session.account?.id ?? session.user.id
    return handler(input, { session, accountId })
  }
}

