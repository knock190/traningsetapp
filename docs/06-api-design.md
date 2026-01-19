## API設計（MVP）

### 認証
Better Authのエンドポイントを使用する（Google OAuth）。
アプリ側はログイン状態の確認とログアウトのみ行う。

### 記録（WorkoutRecord）
| メソッド | パス | 説明 | リクエスト | レスポンス |
| --- | --- | --- | --- | --- |
| GET | /api/workout-records | 期間内の記録一覧を取得 | query: from, to | 200: WorkoutRecord[] |
| POST | /api/workout-records | 記録を追加 | body: WorkoutRecordInput | 201: WorkoutRecord |
| PUT | /api/workout-records/:id | 記録を更新 | body: WorkoutRecordInput | 200: WorkoutRecord |
| DELETE | /api/workout-records/:id | 記録を削除 | - | 204 |

### サマリー
| メソッド | パス | 説明 | リクエスト | レスポンス |
| --- | --- | --- | --- | --- |
| GET | /api/summaries/weekly | 週サマリーを取得 | query: weekStart | 200: WeeklySummary |
| GET | /api/summaries/monthly | 月サマリーを取得 | query: month (YYYY-MM) | 200: MonthlySummary |

### 型（DTO）
| 名前 | フィールド |
| --- | --- |
| WorkoutRecordInput | date, exerciseName, reps, sets, note |
| WorkoutRecord | id, date, exerciseName, reps, sets, note, createdAt, updatedAt |
| WeeklySummary | weekRange, totalSets, dailyBreakdown |
| MonthlySummary | monthRange, totalSets, weeklyBreakdown |
| DailyBreakdownItem | date, totalSets |
| WeeklyBreakdownItem | weekRange, totalSets |

### エラーレスポンス（共通）
| ステータス | 例 |
| --- | --- |
| 400 | バリデーションエラー |
| 401 | 未ログイン |
| 404 | 対象なし |
| 500 | サーバーエラー |
