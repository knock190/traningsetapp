## Features ディレクトリ設計

### 概要
Featuresディレクトリは、アプリケーションの機能をドメイン単位で整理する。
各機能は独立したモジュールとして設計し、凝集度を高く保つ。

### ディレクトリ構造
```
features/
├─ workout/     # 記録入力・一覧・CRUD
├─ summary/     # 週/月サマリー
└─ auth/        # 認証（ログイン/ログアウト）
```

### 機能モジュールの内部構造（例: workout）
```
features/workout/
├─ components/
│  ├─ server/
│  │  └─ WorkoutPageTemplate/
│  │     ├─ index.ts
│  │     └─ WorkoutPageTemplate.tsx
│  └─ client/
│     ├─ WorkoutForm/
│     │  ├─ index.ts
│     │  ├─ WorkoutFormContainer.tsx
│     │  ├─ WorkoutFormPresenter.tsx
│     │  └─ useWorkoutForm.ts
│     └─ WorkoutList/
│        ├─ index.ts
│        ├─ WorkoutListContainer.tsx
│        ├─ WorkoutListPresenter.tsx
│        └─ useWorkoutList.ts
├─ hooks/
│  ├─ useWorkoutQuery.ts
│  └─ useWorkoutMutation.ts
├─ queries/
│  ├─ keys.ts
│  └─ helpers.ts
├─ actions/
│  ├─ createWorkout.ts
│  ├─ updateWorkout.ts
│  └─ deleteWorkout.ts
├─ types/
│  └─ index.ts
└─ utils/
   └─ validation.ts
```

### Container/Presenterパターン
ContainerはDOMを直接レンダリングせず、Presenterにpropsを渡す。

#### Container (ロジック層)
```tsx
// features/workout/components/client/WorkoutList/WorkoutListContainer.tsx
'use client'

import { WorkoutListPresenter } from './WorkoutListPresenter'
import { useWorkoutList } from './useWorkoutList'

export function WorkoutListContainer() {
  const { records, isLoading, handleDelete } = useWorkoutList()

  return (
    <WorkoutListPresenter
      records={records}
      isLoading={isLoading}
      onDelete={handleDelete}
    />
  )
}
```

#### Presenter (表示層)
```tsx
// features/workout/components/client/WorkoutList/WorkoutListPresenter.tsx
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'

export function WorkoutListPresenter({
  records,
  isLoading,
  onDelete,
}: {
  records: WorkoutRecord[]
  isLoading: boolean
  onDelete: (id: string) => void
}) {
  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id}>
          <div>{record.exerciseName}</div>
          <button onClick={() => onDelete(record.id)}>削除</button>
        </div>
      ))}
    </div>
  )
}
```

### Server Componentsテンプレート
```
server/
├─ LoginPageTemplate/
│  ├─ index.ts
│  └─ LoginPageTemplate.tsx
├─ WorkoutPageTemplate/
│  ├─ index.ts
│  └─ WorkoutPageTemplate.tsx
└─ SummaryPageTemplate/
   ├─ index.ts
   └─ SummaryPageTemplate.tsx
```

### Client Componentsの命名規則
index.tsでエクスポートする際は、より具体的な名前に変更する。
```tsx
// features/auth/components/client/Login/index.ts
export { LoginContainer as LoginForm } from './LoginContainer'

// features/workout/components/client/WorkoutList/index.ts
export { WorkoutListContainer as WorkoutList } from './WorkoutListContainer'
```

### Presenterコンポーネントの使用ルール
- Presenterは同じ機能ディレクトリ内のContainerからのみ呼び出す。
- 他のPresenterの直接呼び出しは禁止。

### コンポーネント分割のルール
#### 1ファイル1コンポーネント
- すべてのClient Componentは1ファイルに1コンポーネント。

#### View専用コンポーネント（ロジックなし）
同じディレクトリ内に配置する。

#### ロジックを含むコンポーネント
client配下に新しいディレクトリを作成する。

### ベストプラクティス
1. Presenterは表示のみでロジックを持たない
2. ロジックはContainer + Custom Hookに集約
3. 汎用的なコンポーネントは`shared/`へ移動
4. 型安全性のため型定義は明示的に行う
