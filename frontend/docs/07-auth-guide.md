# 認証設計（プロジェクト固有）

This document captures the current authentication design implemented in this repository. It is intended to be copied to external documentation (e.g., Notion) while also living in the repo root for versioned reference.

## 1. 目的とスコープ

- Provide Google OAuth login and session management for the Next.js app.
- Attach the authenticated `account` entity to the session for downstream use.
- Enforce authentication in the Next.js layer; backend APIs assume trusted callers.

## 2. 信頼境界

- **Auth responsibility**: Next.js (BFF) handles authentication and session checks.
- **Backend assumption**: API requests are made only by the trusted Next.js server.
- **Implication**: Backend does **not** verify auth headers; it trusts `ownerId` provided by the caller.

## 3. 認証プロバイダーとライブラリ

- **Provider**: Google OAuth 2.0
- **Library**: `better-auth` (stateless, cookie-based session)
- **Session caching**: 5 minutes via cookie cache

Relevant file:
- `frontend/src/features/auth/lib/better-auth.ts`

## 4. セッションモデル

- Session is cookie-based and stateless.
- A custom session is created with `customSession` to include `account`.
- Session shape (conceptual):
  - `user`: provider user info (id, email, name, image)
  - `session`: session metadata (id, userId, expiresAt)
  - `account`: application-level account record

## 5. アカウント作成・同期

- On OAuth success, create or update the account in the backend:
  - `POST /api/accounts/auth`
- If `customSession` cannot find an account by email, it attempts creation again (first login fallback).
- Account cache is invalidated after successful OAuth processing.

Relevant files:
- `frontend/src/features/auth/lib/better-auth.ts`
- `frontend/src/external/handler/account/account.command.server.ts`

## 6. キャッシュ戦略

- Account lookup in `customSession` is cached with `unstable_cache`.
- Cache TTL: 5 minutes.
- Cache invalidation: `updateTag("account")` after account creation/update.

Relevant file:
- `frontend/src/features/auth/lib/better-auth.ts`

## 7. 認証ガード（チェックの適用箇所）

### サーバーサイドのリダイレクトガード

- `requireAuthServer()` redirects to `/login` if no valid session.
- `getAuthenticatedSessionServer()` returns a guaranteed authenticated session or redirects.

Relevant file:
- `frontend/src/features/auth/servers/redirect.server.ts`

### Server Action ガード

- `withAuth()` wraps server actions and injects `accountId` from session.

Relevant file:
- `frontend/src/features/auth/servers/auth.guard.ts`

## 8. ログイン / ログアウト UX

- Login page: `/login`
- Login action uses `signIn` from `better-auth`.
- Logout uses `signOut`.

Relevant files:
- `frontend/src/features/auth/lib/better-auth-client.ts`
- `frontend/src/features/auth/components/client/LoginPageClient/*`

## 9. バックエンド API の前提

- Backend does **not** validate auth headers.
- It trusts `ownerId` passed from the Next.js layer.
- Auth endpoint for OAuth linkage:
  - `POST /api/accounts/auth` (Create or Get account)

Relevant docs:
- `docs/global_design/07_api_design.md`

## 10. 認可ルール（要約）

- Owner check required for:
  - Note update / delete / publish / unpublish
  - Template update / delete
- Status-based constraints:
  - Notes: Draft vs Publish access
  - Templates: isUsed=true restricts structure changes

Relevant docs:
- `docs/global_design/07_api_design.md`

## 11. 環境変数

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

Relevant file:
- `frontend/src/features/auth/lib/better-auth.ts`
- `frontend/src/features/auth/lib/better-auth-client.ts`

## 12. アカウントデータモデル（主要フィールド）

- `id`
- `email`
- `firstName`
- `lastName`
- `provider` (e.g., "google")
- `providerAccountId`
- `thumbnail`
- `lastLoginAt`

Relevant docs:
- `docs/global_design/05_domain_design.md`
- `docs/global_design/06_database_design.md`

## 13. テストチェックリスト（最低限）

- First login creates account and attaches to session.
- Re-login updates profile and `lastLoginAt`.
- Unauthenticated access redirects to `/login`.
- Non-owner actions are rejected.

## 14. ディレクトリ構造（認証 + アカウント連携）

```
frontend/src
├─ app
│  ├─ api/auth/[...all]/route.ts            # better-auth のAPIルート
│  ├─ (guest)/login/                        # ログイン画面
│  └─ (authenticated)/                      # 認証必須エリア（layoutでガード）
│
├─ features/auth
│  ├─ lib/
│  │  ├─ better-auth.ts                     # 認証本体設定（OAuth/Session/customSession）
│  │  └─ better-auth-client.ts              # client側の signIn/signOut/useSession
│  ├─ servers/
│  │  ├─ auth.server.ts                     # セッション取得
│  │  ├─ redirect.server.ts                 # 認証必須/未認証リダイレクト
│  │  ├─ auth.guard.ts                      # Server Action 用 withAuth
│  │  └─ auth-check.server.ts               # 認証状態チェック
│  ├─ components/
│  │  ├─ client/LoginPageClient/*           # ログインUI（Googleログイン導線）
│  │  └─ server/LoginPageTemplate/*         # ログインページのサーバー側ラッパー
│  └─ types/better-auth.d.ts                # Session型拡張
│
├─ external/handler/account
│  ├─ account.command.server.ts             # OAuth成功時の createOrGetAccount など
│  ├─ account.command.action.ts             # Server Action 入口（withAuth適用）
│  ├─ account.query.server.ts               # account取得クエリ
│  └─ account.query.action.ts               # Server Action 入口
│
├─ external/service/account
│  └─ account.service.ts                    # AccountsApi への通信ラッパー
│
├─ external/dto/account.dto.ts              # Account の DTO / バリデーション
│
├─ external/client/api
│  ├─ config.ts                             # APIクライアント設定
│  └─ generated/*                           # OpenAPI 生成コード（AccountsApi等）
│
├─ external/handler/auth
│  └─ token.command.server.ts               # 認証トークン関連のサーバー処理
├─ external/service/auth
│  └─ token-verification.service.ts         # トークン検証サービス
└─ external/client/google-auth
   └─ client.ts                             # Google OAuth クライアント
```

## 15. BFFがDB直結とAPI呼び出しの違い（実例）

### 15.1 比較（要点）

| 観点 | DB直結（BFF→DB） | API呼び出し（BFF→Backend API→DB） |
|---|---|---|
| 接続先 | BFFが直接DBに接続 | BFFはHTTP/gRPCでバックエンドへ |
| 変更耐性 | DB変更がフロントに直撃 | API契約維持で影響を抑制 |
| セキュリティ境界 | BFFにDB権限が必要 | DB権限はバックエンドに集約 |
| スケール | BFFとDBの結合が強い | バックエンドで分離・拡張しやすい |
| 認証/認可 | BFF内で完結しがち | バックエンド側で厳密化しやすい |
| 開発速度 | 速い（直結で楽） | API設計・実装が必要 |

### 15.2 コード差分例（Note作成）

**API呼び出し版（現行実装）**  
`frontend/src/external/service/note/note.service.ts`

```ts
async createNote(ownerId: string, request: CreateNoteRequest) {
  const note = await this.api.notesCreateNote({
    modelsCreateNoteRequest: {
      title: request.title,
      templateId: request.templateId,
      ownerId,
      sections: request.sections?.map((section) => ({
        fieldId: section.fieldId,
        content: section.content,
      })) ?? [],
    },
  });
  return toNoteResponse(note);
}
```

**DB直結版（ドキュメント上の例）**  
`frontend/docs/05_external_layer.md`

```ts
// 現在: Next.jsから直接DB操作（開発効率重視）
const result = await db
  .insert(notes)
  .values({
    id: generateId(),
    title: input.title,
    templateId: input.templateId,
    ownerId: userId,
    status: 'Draft',
  })
  .returning();
```

## 16. セキュリティ設定（Cookie / CSRF）

- セッションは Cookie ベース（better-auth の stateless モード）。
- Cookie 属性（`httpOnly / sameSite / secure`）は明示設定がなく、デフォルト挙動に依存。**要確認**。
- CSRF 対策はリポジトリ内に明示設定が見当たらないため、**better-auth/Next.js の標準挙動に依存**。**要確認**。

## 17. OAuth 運用設定

- Redirect URI:
  - `${BASE_URL}/api/auth/callback/google`
  - `BASE_URL` は `NEXTAUTH_URL` → `NEXT_PUBLIC_APP_URL` → `http://localhost:3000` の順で解決。
- ログイン後の遷移:
  - `callbackURL: "/notes"`
- OAuth スコープや許可ドメインは明示設定が見当たらないため、**デフォルト挙動**。**要確認**。

Relevant file:
- `frontend/src/external/client/google-auth/client.ts`
- `frontend/src/features/auth/components/client/LoginPageClient/useLoginClient.ts`

## 18. セッション有効期限と再認証条件

- Cookie キャッシュ期間: 5 分（`cookieCache.maxAge`）。
- セッションの実際の失効時間は明示設定が見当たらないため **要確認**。
- セッションが無効/エラーの場合は `/login` にリダイレクト。

Relevant file:
- `frontend/src/features/auth/lib/better-auth.ts`
- `frontend/src/features/auth/servers/redirect.server.ts`

## 19. ログアウトの挙動

- クライアントで `signOut()` を実行。
- React Query のキャッシュを全クリアし、`/login` へ遷移。
- サーバー側のセッション破棄や失効ポリシーは明示設定が見当たらないため **要確認**。

Relevant file:
- `frontend/src/shared/components/layout/client/Header/useHeader.ts`

## 20. 失敗時フロー（UX）

- OAuth 成功後のアカウント作成/更新に失敗した場合はエラーをログ出力し、認証を失敗として扱う。
- セッションエラーや未認証時は `/login` にリダイレクト。
- ユーザー向けのエラーメッセージ表示は明示実装が見当たらないため **要確認**。

Relevant file:
- `frontend/src/features/auth/lib/better-auth.ts`
- `frontend/src/features/auth/servers/redirect.server.ts`

## 21. アカウントのライフサイクル

- OAuth ログイン時に `createOrGetAccount` で作成/更新。
- 退会/無効化/メール変更などのライフサイクルは明示設計が見当たらないため **要確認**。

## 22. 信頼境界の補強策

- 「BFF を信頼できる前提」を技術的に担保する仕組み（IP 制限、API キー、内部ネットワーク等）は明示されていないため **要確認**。
