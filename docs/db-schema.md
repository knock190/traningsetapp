## テーブル設計（MVP）

### workout_records
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | 記録ID |
| date | date | NOT NULL | 記録日 |
| exercise_name | text | NOT NULL | 種目名 |
| reps | integer | NOT NULL | 回数（記録のみ） |
| sets | integer | NOT NULL | セット数（集計対象） |
| note | text | NULL | メモ |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

### auth_users（Better Auth）
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | text | PK | ユーザーID |
| name | text | NULL | 表示名 |
| email | text | UNIQUE | メールアドレス |
| image | text | NULL | プロフィール画像 |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

### auth_accounts（Better Auth）
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | text | PK | アカウントID |
| user_id | text | FK | ユーザーID |
| provider | text | NOT NULL | プロバイダー名（google） |
| provider_account_id | text | NOT NULL | プロバイダー側ID |
| access_token | text | NULL | アクセストークン |
| refresh_token | text | NULL | リフレッシュトークン |
| expires_at | timestamp | NULL | 有効期限 |

### auth_sessions（Better Auth）
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | text | PK | セッションID |
| user_id | text | FK | ユーザーID |
| expires_at | timestamp | NOT NULL | 有効期限 |
| created_at | timestamp | NOT NULL | 作成日時 |

### 補足
- Better Authの実際のテーブル構成はAdapter設定に依存する。
- まずは上記を前提に進め、実装時に公式スキーマに合わせる。
