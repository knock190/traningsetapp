# traningsetapp

筋トレの記録を端末ローカルに保存し、週・月のセット数を自動集計して可視化するアプリです。
入力を最短にして、記録の継続を助けることを目的としています。

関連ドキュメント:
- `docs/01-requirements.md`
- `docs/02-usecases.md`
- `docs/03-ubiquitous-language.md`
- `docs/04-domain-design.md`
- `docs/05-ui-design.md`
- `docs/06-api-design.md`
- `docs/07-db-schema.md`

## 設計方針まとめ
- 目的: 入力を最短にし、週/月のセット数を自動集計して継続を支援
- アーキテクチャ: Next.js App Router + Server Components優先、features/shared/externalで責務分離
- データ: Postgres + Drizzleで永続化、集計はサーバー側で処理
- 認証: Better Auth + Google OAuth（statelessセッション）
- UI: 今日の記録 / サマリー / ログインの最小構成、モバイル優先

## 設計背景と意思決定
- 課題: 毎日の記録を暗算せずに集計し、継続しやすい入力体験を作る
- 前提: 単一ユーザー、オフライン志向、MVPは機能を絞る
- 判断: 週/月の集計に集中し、重量・部位などはスコープ外にする
- データ設計: 記録は1件単位で保持し、期間内のセット数合計だけを算出
- UI設計: 入力→当日一覧→合計が最短動線になるよう1画面完結
- 認証: 将来の拡張と本人確認のためGoogle OAuthを採用
- 技術選定: 型安全と分業しやすさを優先（TS + Drizzle + Zod + TanStack Query）
- 変更容易性: external層を分離し、将来のAPI移行に対応

## フロント設計ドキュメント
- `frontend/docs/01-tech-stack.md`
- `frontend/docs/02-architecture.md`
- `frontend/docs/03-app-router-guide.md`
- `frontend/docs/04-features-design.md`
- `frontend/docs/05-external-layer.md`
- `frontend/docs/06-tanstack-query-guide.md`
- `frontend/docs/07-auth-guide.md`

## フロント設計概要（意図とメリット）
- 目的: 3画面（ログイン/今日/サマリー）に絞り、学習コストと操作コストを最小化
- 構成: App Router + RSC優先で、初期表示を軽くし保守コストを抑える
- 分割: `features`/`shared`/`external` に分けて、変更の影響範囲を局所化
- 状態管理: TanStack Queryで「取得・更新・キャッシュ」を一元化し、表示の一貫性を担保
- データ取得: Server Actionに集約して型安全と実装の見通しを確保

## データ取得フロー
```
Page (RSC)
  -> Feature Template
    -> Container (Client)
      -> Custom Hook
        -> Server Action
          -> External Service
            -> DB
```

## フロントのディレクトリ構成（意図）
```
frontend/src/
├─ app/          # ルーティングとRSC。画面の入口に限定
├─ features/     # 機能単位で閉じる。変更の影響範囲を局所化
├─ shared/       # UIやユーティリティを共通化して重複削減
└─ external/     # DB/APIを隔離し、将来の移行コストを下げる
```

## クライアントコンポーネント（意図とメリット）
- 役割管理: Next.jsでは`use client`がないとサーバー実行になるため、client/serverでフォルダを分けて混在を防ぐ
- 分離: ロジックはカスタムフックへ集約し、Containerがフック→Presenterへpropsを渡す橋渡し役、Presenterは表示に集中
- 可読性: UIの見通しが良く、デザイン変更が安全にできる
- 再利用: 表示部品は`shared/components`へ集約し、重複実装を防ぐ
- 保守性: 1ファイル1コンポーネントで影響範囲を小さくする
- テスト容易性: ロジック/表示を分けることで検証対象を絞り込める

## データフェッチの狙いとメリット
- 変更耐性: Server Actionを唯一の入口にして境界を固定し、API/DB変更の影響を局所化
- 体験品質: TanStack Queryで画面間の状態を共有し、体感速度と再取得コストを改善
- 転送効率: 期間指定の記録一覧と週/月サマリーに絞って取得し、無駄なペイロードを削減
- 正確性: 追加/更新/削除後は関連クエリのみinvalidateし、局所的に整合性を回復
- 計算負荷: 週/月の合計と内訳はサーバー側で算出し、クライアントを軽量化

## 認証フローの要点
- 方式: Better Auth + Google OAuth（statelessセッション）
- エントリ: `/api/auth/*` を経由してOAuthとセッション管理
- セッション: Cookieベース、サーバーで`getSession`を利用
- ガード: `(authenticated)`配下は未ログイン時にリダイレクト
- ログアウト: クライアントから`signOut`を実行

## External層の概要（意図とメリット）
- 役割明確化: DB/APIとの境界をexternalに集約し、UIから外部依存を隠蔽
  - UIは表示と操作に専念し、外部I/Oの詳細はexternalに閉じる
  - 入出力の形をDTOで固定し、層ごとの責務を明確化
- 変更容易性: 直接DB→外部APIへの移行でも呼び出し口を維持できる
  - UI側の呼び出しはServer Action→externalに固定され、移行時の修正箇所を限定
  - service/handlerの入れ替えで、プロジェクト拡大時も素早く対応できる
- 型安全: DTOで入出力を固定し、画面側の型を安定させる
- テスト性: service/handlerをモックしやすく、機能単位で検証できる
- 安全性: `server-only`で外部アクセスをサーバー側に限定
