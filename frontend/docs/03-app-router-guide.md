## App Router 設計ガイド

### 基本方針
- `page.tsx`と`layout.tsx`は全てRSC (React Server Component)
- `error.tsx`のみClient Component
- ビジネスロジックは`features/`に委譲
- ルート構造で認証状態を表現
- Next.js 15+のグローバル型定義（`LayoutProps`/`PageProps`）を活用

### ルートグループ戦略

#### 認証別グループ
```
app/
├─ (guest)/          # 未ログインユーザー向け
│  └─ login/
├─ (authenticated)/  # ログイン必須
│  ├─ page.tsx        # 今日の記録
│  └─ summary/
└─ (neutral)/        # 認証不問
   ├─ terms/
   └─ privacy/
```

#### グループ別設定
| グループ | Layout | 認証チェック | 共通UI |
| --- | --- | --- | --- |
| `(guest)` | シンプル | ログイン済みならリダイレクト | なし |
| `(authenticated)` | フル機能 | 必須 | Header, BottomNav |
| `(neutral)` | 最小限 | なし | Footer のみ |

### ページコンポーネントパターン

#### 基本構造
```tsx
// app/(authenticated)/summary/page.tsx
import { SummaryPageTemplate } from '@/features/summary/components/server/SummaryPageTemplate'

export default async function SummaryPage(props: PageProps<'/summary'>) {
  const searchParams = await props.searchParams
  return <SummaryPageTemplate searchParams={searchParams} />
}
```

#### メタデータ設定
```tsx
// app/(authenticated)/summary/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'サマリー | 筋トレセット数',
  description: '週/月の合計セット数を確認',
}

export default function SummaryLayout(props: LayoutProps<'/summary'>) {
  return <>{props.children}</>
}
```

### 認証レイアウト実装
```tsx
// app/(authenticated)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from '@/shared/lib/auth'
import { AuthenticatedLayoutWrapper } from '@/shared/components/layout/server/AuthenticatedLayoutWrapper'

export default async function AuthenticatedLayout(props: LayoutProps<'/'>) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <AuthenticatedLayoutWrapper user={session.user}>
      {props.children}
    </AuthenticatedLayoutWrapper>
  )
}
```

### エラーハンドリング
```tsx
// app/(authenticated)/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-md"
      >
        再試行
      </button>
    </div>
  )
}
```

### ローディング状態
```tsx
// app/(authenticated)/summary/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
```
