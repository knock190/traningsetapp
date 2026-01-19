## External Layer (外部連携層)

### 概要
External層は、アプリケーションと外部システム（DB、API）との境界を管理する。
将来的にバックエンドを外部APIへ移行する際の変更可用性を考慮し、層として分離する。

### 設計思想
- **変更可用性**: 外部API移行時の影響を最小化
- **関心の分離**: ビジネスロジックと外部依存を分離
- **型安全性**: DTOによる入出力の型保証

### ディレクトリ構造
```
external/
├─ dto/          # データ転送オブジェクト（API契約）
├─ handler/      # エントリーポイント（CQRSパターン）
├─ service/      # ビジネスロジック・API呼び出し
└─ client/       # HTTPクライアント・DB接続（将来的にはAPIクライアントのみ）
```

### レイヤーの責務
#### DTO (Data Transfer Object)
APIとの契約を定義する。バックエンドが変わってもインターフェースを維持する。

```ts
// external/dto/workout.dto.ts
import { z } from 'zod'

export const WorkoutRecordInputSchema = z.object({
  date: z.string(),
  exerciseName: z.string().min(1),
  reps: z.number().int().min(0),
  sets: z.number().int().min(0),
  note: z.string().optional(),
})

export const WorkoutRecordSchema = WorkoutRecordInputSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const WeeklySummarySchema = z.object({
  weekRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  totalSets: z.number().int(),
  dailyBreakdown: z.array(
    z.object({
      date: z.string(),
      totalSets: z.number().int(),
    })
  ),
})
```

#### Handler (CQRSパターン)
コマンド（書き込み）とクエリ（読み取り）を分離する。

```ts
// external/handler/workout.query.server.ts
import 'server-only'
import { workoutService } from '../service/workout.service'
import { WorkoutRecordSchema } from '../dto/workout.dto'

export async function listWorkoutRecordsServer(from: string, to: string) {
  const records = await workoutService.listRecords({ from, to })
  return records.map((record) => WorkoutRecordSchema.parse(record))
}
```

```ts
// external/handler/workout.command.action.ts
'use server'
import { WorkoutRecordInputSchema } from '../dto/workout.dto'
import { workoutService } from '../service/workout.service'
import { getCurrentUser } from '@/shared/lib/auth'

export async function createWorkoutRecordAction(request: unknown) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const validated = WorkoutRecordInputSchema.parse(request)
  const record = await workoutService.createRecord(validated)
  return { id: record.id }
}
```

#### Service (ビジネスロジック)
現在はDBに直接アクセスし、将来的に外部API呼び出しへ置換可能にする。

```ts
// external/service/workout.service.ts
import { db } from '../client/db'
import type { WorkoutRecordInput } from '../dto/workout.dto'

class WorkoutService {
  async createRecord(input: WorkoutRecordInput) {
    // 現在: DrizzleでDB直接操作
    return db.insert(/* ... */)
  }

  async listRecords({ from, to }: { from: string; to: string }) {
    return db.select(/* ... */)
  }
}

export const workoutService = new WorkoutService()
```

#### Client (外部通信)
HTTPクライアントやDB接続を管理する。

```ts
// external/client/api-client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})
```

### データフロー
#### 現在の実装（Next.js + DB直接接続）
```
Client Component
    ↓
Server Action (*.action.ts)
    ↓
Service (DB直接操作)
    ↓
Database (Drizzle ORM)
```

#### 将来の実装（Next.js + 外部API）
```
Client Component
    ↓
Server Action (*.action.ts)
    ↓
Service (API呼び出し)
    ↓
External API
    ↓
Database
```

### 命名規則
- **Query**: `*.query.server.ts`
- **Command**: `*.command.action.ts`
- **Server専用**: `import 'server-only'`を必ず記載
- **型定義**: DTOは入出力の契約を定義

### ベストプラクティス
1. DTOのインターフェースは変更しない
2. サービス層でDB/APIを抽象化
3. エラーは層内で統一形式に変換
4. テストはサービス層をモックして行う
