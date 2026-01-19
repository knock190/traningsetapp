## 認証システム実装ガイド

### 概要
Better Auth を使用した認証システム。Google OAuth 2.0 による認証と、stateless セッション管理を採用する。

### 技術スタック
| 項目 | 技術 |
| --- | --- |
| 認証ライブラリ | Better Auth |
| OAuth プロバイダ | Google OAuth 2.0 |
| セッション管理 | Stateless（Cookie ベース） |
| ユーザーデータ | PostgreSQL（accounts テーブル） |
| キャッシュ | Next.js unstable_cache |

### アーキテクチャ
```
┌─────────────────────────────────────────────────────────────────┐
│                        認証フロー                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ユーザー                                                        │
│     │                                                           │
│     ▼                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ ログイン    │───▶│ Google     │───▶│ コールバック │         │
│  │ ボタン     │    │ OAuth 2.0  │    │ /api/auth/* │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│                                               │                 │
│                                               ▼                 │
│                                        ┌─────────────┐         │
│                                        │ Better Auth │         │
│                                        │ (stateless) │         │
│                                        └──────┬──────┘         │
│                                               │                 │
│                      ┌────────────────────────┼────────────┐   │
│                      │                        │            │   │
│                      ▼                        ▼            ▼   │
│               ┌─────────────┐         ┌─────────────┐  ┌─────┐│
│               │ onSuccess   │         │customSession│  │Cookie││
│               │ (初回のみ)  │         │ (毎回実行)  │  │保存 ││
│               └──────┬──────┘         └──────┬──────┘  └─────┘│
│                      │                       │                 │
│                      ▼                       ▼                 │
│               ┌─────────────┐         ┌─────────────┐         │
│               │ handler     │         │unstable_cache│         │
│               │ (command)   │         │ (5分キャッシュ)│        │
│               └──────┬──────┘         └──────┬──────┘         │
│                      │                       │                 │
│                      ▼                       ▼                 │
│               ┌─────────────────────────────────────┐         │
│               │         accounts テーブル           │         │
│               │    (id, email, provider, etc.)     │         │
│               └─────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Stateless セッションとは
| 項目 | Stateful | Stateless（採用） |
| --- | --- | --- |
| セッション保存 | DB（sessions テーブル） | Cookie（署名付き） |
| DBアクセス | 毎リクエスト | 不要 |
| スケーラビリティ | サーバー間で共有必要 | 各サーバーで独立処理可能 |
| ログアウト | DBから削除 | Cookie削除のみ |

#### メリット
- DBへのセッション問い合わせが不要（高速）
- 水平スケーリングが容易
- sessionsテーブルが不要

#### デメリット
- サーバー側から強制ログアウトが難しい
- セッションデータの即時更新が難しい

### 処理フロー詳細

#### 1. ログインボタンクリック
```typescript
// features/auth/components/client/LoginForm.tsx
const handleLogin = async () => {
  await signIn.social({
    provider: 'google',
    callbackURL: '/',
  })
}
```

#### 2. Google OAuth 認証
1. ユーザーがGoogleのログイン画面にリダイレクト
2. Googleアカウントでログイン
3. 認可コードがコールバックURLに返される
4. Better Authがアクセストークンを取得

#### 3. Better Auth コールバック処理
```typescript
// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/features/auth/lib/better-auth'

export const { GET, POST } = toNextJsHandler(auth)
```

#### 4. onSuccess コールバック（初回ログイン時）
```typescript
// features/auth/lib/better-auth.ts
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    async onSuccess(ctx) {
      await createOrGetAccountCommand({
        email: ctx.user.email,
        name: ctx.user.name || ctx.user.email,
        provider: 'google',
        providerAccountId: ctx.user.id,
        thumbnail: ctx.user.image || undefined,
      })
    }
  }
}
```

#### 5. customSession プラグイン（毎回実行）
```typescript
// features/auth/lib/better-auth.ts
customSession(async ({ user, session }) => {
  let account = await getCachedAccount(user.email)
  if (!account) {
    await createOrGetAccountCommand({ ... })
    account = await getAccountByEmailQuery(user.email)
  }
  return { user, session, account }
})
```

#### 6. セッション取得
```typescript
// features/auth/servers/auth.server.ts
export async function getSessionServer(): Promise<Session | null> {
  return await auth.api.getSession({ headers: await headers() })
}
```

### キャッシュ戦略
#### サーバーサイド（unstable_cache）
```typescript
const getCachedAccount = unstable_cache(
  async (email: string): Promise<Account | null> => {
    return await getAccountByEmailQuery(email)
  },
  ['account-by-email'],
  {
    revalidate: 300,
    tags: ['account'],
  }
)
```

| 設定 | 値 | 説明 |
| --- | --- | --- |
| revalidate | 300秒 | キャッシュの有効期間 |
| tags | ["account"] | revalidateTag で無効化可能 |

#### クライアントサイド（Cookie Cache）
```typescript
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
  },
}
```

### 型定義（Module Augmentation）
```typescript
// features/auth/types/better-auth.d.ts
declare module 'better-auth' {
  interface Session {
    account?: Account
  }
}
```

### 認証ガード
#### サーバーコンポーネント
```typescript
// features/auth/servers/redirect.server.ts
export async function requireAuthServer(): Promise<Session> {
  const session = await getSessionServer()
  if (!session?.account?.id) {
    redirect('/login')
  }
  return session
}
```

### 環境変数
```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Better Auth
NEXTAUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key
```

### データベーススキーマ
```typescript
// external/db/schema.ts
export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    thumbnail: text('thumbnail'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex('accounts_email_idx').on(table.email),
    providerIdx: uniqueIndex('accounts_provider_idx').on(
      table.provider,
      table.providerAccountId
    ),
  })
)
```

### ユニーク制約
| 制約 | カラム | 目的 |
| --- | --- | --- |
| accounts_email_idx | email | メールアドレスの重複防止 |
| accounts_provider_idx | (provider, provider_account_id) | 同一プロバイダの重複防止 |

### 重複アカウント処理
```typescript
// external/repository/account.repository.ts
.onConflictDoUpdate({
  target: [accounts.provider, accounts.providerAccountId],
  set: {
    email: data.email,
    name: data.name,
    thumbnail: data.thumbnail,
    lastLoginAt: new Date(),
    updatedAt: new Date(),
  },
})
```

### ファイル構成
```
features/auth/
├── lib/
│   ├── better-auth.ts
│   └── better-auth-client.ts
├── servers/
│   ├── auth.server.ts
│   └── redirect.server.ts
├── types/
│   └── better-auth.d.ts
├── components/
│   ├── client/
│   │   └── LoginForm/
│   └── server/
│       └── LoginPageTemplate/
└── hooks/
    └── useSession.ts
```

### トラブルシューティング
#### セッションが取得できない
1. Cookieが正しく設定されているか確認
2. `BETTER_AUTH_SECRET` が設定されているか確認
3. `NEXTAUTH_URL` が正しいか確認

#### アカウントが作成されない
1. データベース接続を確認
2. accounts テーブルが存在するか確認（`npm run db:push`）
3. ユニーク制約違反がないか確認

#### customSession でエラー
1. `getAccountByEmailQuery` がnullを返していないか確認
2. unstable_cache のタグが正しいか確認
3. handler → service → repository の呼び出し順序を確認
