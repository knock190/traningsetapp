## エンティティ
| エンティティ | 説明 | 主な属性(プロパティ) |
| --- | --- | --- |
| WorkoutRecord | 1回のトレーニング記録。日付・種目・回数・セット数を保持する。 | id, date, exerciseName, reps, sets, note, createdAt, updatedAt |
| AuthSession | Google OAuthのログイン状態を表すセッション。 | id, userId, provider, createdAt, expiresAt |

## 値オブジェクト
| 名前 | 使う場所 | 守るルール |
| --- | --- | --- |
| DateYmd | 記録日付、週/月の期間計算 | YYYY-MM-DD形式の不変値 |
| ExerciseName | 記録入力の種目名 | 空文字不可、上限長あり |
| Reps | 記録入力の回数 | 0以上の整数 |
| Sets | 記録入力のセット数 | 0以上の整数 |
| Note | 記録入力のメモ | 文字列、上限長あり |
| WeekRange | 週サマリー期間 | 月曜開始〜日曜終了の期間 |
| MonthRange | 月サマリー期間 | 月初〜月末の期間 |

## 集約
| チーム名(集約) | 集約ルート(リーダー) | 中にいるメンバー(子エンティティ・VO) | 外からとの関係・使い方 | チームの役割(ざっくり) |
| --- | --- | --- | --- | --- |
| WorkoutRecord集約 | WorkoutRecord | DateYmd, ExerciseName, Reps, Sets, Note | リポジトリ経由で作成/更新/削除。集計サービスから読み取り参照される。 | 1件の記録の整合性と入力制約を守る |

## ドメインロジック
| チーム名(ロジック) | ルール | 何をしている？ |
| --- | --- | --- |
| 週の開始/終了計算 | 月曜開始〜日曜終了で算出する | 週サマリーの期間を決める |
| 月初/月末計算 | 対象月の月初〜月末で算出する | 月サマリーの期間を決める |
| 期間内セット数合計 | セット数のみを合計し、回数は対象外 | 週/月の合計セット数を計算する |
| 当日合計セット数 | 当日分のセット数のみを合計する | 今日の合計セット数を計算する |

## ドメインサービス
| サービス名 | どんな仕事？ | 関わるドメイン(集約) |
| --- | --- | --- |
| SummaryService | 記録一覧と期間から合計・内訳を計算する | WorkoutRecord集約 |
| RangeService | 日付から週/月の期間を生成する | WorkoutRecord集約 |

## 集計結果（VO/DTO）
| 名前 | 使う場所 | 含まれる内容 |
| --- | --- | --- |
| WeeklySummary | 週サマリー表示 | weekRange, totalSets, dailyBreakdown |
| MonthlySummary | 月サマリー表示 | monthRange, totalSets, weeklyBreakdown |
| DailyBreakdownItem | 週サマリー内訳 | date, totalSets |
| WeeklyBreakdownItem | 月サマリー内訳 | weekRange, totalSets |

## 集約境界とトランザクション境界
| 集約 | トランザクション対象 | 理由 |
| --- | --- | --- |
| WorkoutRecord集約 | 1件の記録の作成/更新/削除 | 1件単位で整合性を守れば十分で、他集約との一括更新が不要 |

### トランザクションが必要な操作
- 記録の作成（WorkoutRecordの新規登録）
- 記録の更新（WorkoutRecordの編集）
- 記録の削除（WorkoutRecordの削除）
