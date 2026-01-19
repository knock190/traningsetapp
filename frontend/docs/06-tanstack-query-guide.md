## TanStack Query 実装ガイド

### 概要
TanStack Queryを使用してサーバー状態を管理し、Next.js App RouterのServer Componentsと連携させる。

### セットアップ
#### Provider設定
```tsx
// shared/providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // RSCのhydrateデータを常に優先
            gcTime: 5 * 60 * 1000, // 5分
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

#### staleTimeとgcTimeの設定意図
| 設定 | 値 | 理由 |
| --- | --- | --- |
| staleTime | 0 | RSCでhydrateされたデータを常に優先 |
| gcTime | 5分 | キャッシュを保持し再取得を抑える |

### サーバー用QueryClient
```tsx
// shared/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

export const getQueryClient = cache(() => new QueryClient())
```

### クエリキーの管理
```ts
// features/workout/queries/keys.ts
export const workoutKeys = {
  all: ['workout-records'] as const,
  lists: () => [...workoutKeys.all, 'list'] as const,
  list: (filters: { from: string; to: string }) =>
    [...workoutKeys.lists(), filters] as const,
}

// features/summary/queries/keys.ts
export const summaryKeys = {
  weekly: (weekStart: string) => ['summary', 'weekly', weekStart] as const,
  monthly: (month: string) => ['summary', 'monthly', month] as const,
}
```

### サーバーサイドプリフェッチ
```tsx
// features/workout/components/server/WorkoutPageTemplate/WorkoutPageTemplate.tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/shared/lib/query-client'
import { workoutKeys } from '@/features/workout/queries/keys'
import { listWorkoutRecordsServer } from '@/external/handler/workout.query.server'
import { WorkoutListContainer } from '../../client/WorkoutList'

export async function WorkoutPageTemplate({ from, to }: { from: string; to: string }) {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: workoutKeys.list({ from, to }),
    queryFn: () => listWorkoutRecordsServer(from, to),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkoutListContainer />
    </HydrationBoundary>
  )
}
```

### クライアントサイドQuery
Server Actionsを使用してデータフェッチを行う。
```ts
// features/workout/hooks/useWorkoutQuery.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { workoutKeys } from '../queries/keys'
import { listWorkoutRecordsAction } from '@/external/handler/workout.query.action'

export function useWorkoutListQuery(from: string, to: string) {
  return useQuery({
    queryKey: workoutKeys.list({ from, to }),
    queryFn: () => listWorkoutRecordsAction({ from, to }),
  })
}
```

### Mutation実装
```ts
// features/workout/hooks/useWorkoutMutation.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workoutKeys } from '../queries/keys'
import {
  createWorkoutRecordAction,
  updateWorkoutRecordAction,
  deleteWorkoutRecordAction,
} from '@/external/handler/workout.command.action'

export function useCreateWorkoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWorkoutRecordAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() })
    },
  })
}

export function useUpdateWorkoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateWorkoutRecordAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() })
    },
  })
}

export function useDeleteWorkoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWorkoutRecordAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() })
    },
  })
}
```

### パフォーマンス最適化
- Prefetchで初期表示を高速化
- invalidateは関連クエリに限定
- Suspense利用は必要箇所のみで検討する
