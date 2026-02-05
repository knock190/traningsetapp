# 設計方針概要（フロントエンド）


## 1. 目的・対象読者
本アプリのフロントエンド設計の考え方と構成を短時間で理解できるようにまとめた資料です。


## 2. プロダクト概要
筋トレの記録と週/月サマリーを管理できるWebアプリ。

## 3. 変更点を最小化できる理由
MVP時点で「責務分離」「API移行の吸収点」「型の契約固定」を用意しているため、
成長フェーズでも大きなリファクタをせずに拡張できます。

- ルートグループで認証条件を分離
- Feature単位で機能追加
- External層でDB/APIの差し替えが可能

## 4. 技術構成
フロントエンドは Next.js(App Router) を中心に構成しています。


### コア技術
| カテゴリ | 技術 | 備考 |
| --- | --- | --- |
| Framework | Next.js | App Router 前提 |
| 言語 | TypeScript | 型安全性を重視 |
| UI | React | RSCを優先利用 |

### 主要ライブラリ
| 用途 | ライブラリ | 目的 |
| --- | --- | --- |
| スタイリング | Tailwind CSS | UI実装の生産性 |
| UIコンポーネント | shadcn/ui | カスタマイズ性 |
| 状態管理 | TanStack Query | サーバー状態の管理 |
| フォーム | React Hook Form + Zod | 型安全な入力処理 |
| 認証 | Better Auth | カスタムセッション対応 |
| ORM | Drizzle | 型安全なDB操作 |
| コード品質 | Biome | 高速なLint/Format |

### インフラストラクチャ
| 項目 | サービス | 目的 |
| --- | --- | --- |
| 本番DB | Neon | Postgres互換 |
| 開発DB | Docker Compose | 開発環境の再現性 |
| ホスティング | Cloud Run | コンテナ実行 |
| 認証プロバイダー | Google OAuth | ソーシャルログイン |

### 開発環境要件
- Node.js 22.x 以上
- pnpm 10.x 以上
- Docker Desktop（開発DB用）

## 5. 設計原則
ドキュメントで明文化している設計原則は以下の通りです。

- **関心の分離**: ルーティング/UI/ロジック/外部連携を分離
- **Server Components優先**: 初期表示の高速化とJS量の最小化
- **型安全性**: TypeScript + Zodで入出力の契約を固定
- **テスタビリティ**: 層ごとに独立して検証できる構造
- **変更可用性**: DB直結からAPI移行の変更点を局所化

## 6. 全体構成とレイヤー責務

```
frontend/src/
├─ app/          # App Router (薄く保つ)
├─ features/     # 機能別モジュール
├─ shared/       # 共通コンポーネント・ユーティリティ
└─ external/     # 外部連携層 (DB/API)
```

- **app/**: ルーティング、認証チェック、メタデータ
- **features/**: 機能単位のUI/ロジック
- **shared/**: 再利用コンポーネント、ユーティリティ
- **external/**: DB/APIとの境界、DTOとハンドラ

## 7. App Router 設計

```
app/
├─ (guest)/          # 未ログインユーザー向け
│  └─ login/
├─ (authenticated)/  # ログイン必須
│  ├─ page.tsx
│  └─ summary/
└─ (neutral)/        # 認証不問
```

- `page.tsx` / `layout.tsx` はRSC
- `error.tsx` のみClient Component
- ルートグループで認証条件とUI構成を明確化

## 8. Features設計
機能は `features/` に集約し、1機能=1モジュールとして責務を閉じます。
MVPでは開発速度を高めつつ、成長期でも影響範囲を限定できる構造です。
コンポーネントは `client` と `server` に分けて管理しています。
Next.jsでは `'use client'` の記載がないコンポーネントはサーバーで動作するため、
どのファイルがクライアント実行かを明確にする目的で分離しています。

### 8.1 機能モジュールの基本構成

```
features/workout/
├─ components/
│  ├─ server/               # RSCテンプレート
│  └─ client/               # Client UI（Container/Presenter）
├─ hooks/                   # ロジックを集約
├─ queries/                 # Queryキー・補助関数
├─ actions/                 # UI用アクション
└─ types/                   # 機能単位の型
```

### 8.2 Container / Presenter パターン
- **Container**: ロジック担当（Hooks、データ取得、イベント処理）
- **Presenter**: 表示専用（UIを純粋に描画）

```
Container
  ↓ props
Presenter
```

この分離により、UI変更とロジック変更の影響を切り分けられます。

### 8.3 Server Template の役割
- RSCとしてデータの事前取得を担当
- Client Componentへpropsを渡す「橋渡し」役

```
Page (RSC)
  ↓
Feature Template (RSC)
  ↓
Client Container
```

### 8.4 影響範囲の局所化
- 新規画面は該当feature配下に閉じる
- 共有可能なものは`shared/`に切り出す
- 他機能への副作用を最小化

### 8.5 成長期での追加対応
- 機能追加: 新しいfeatureを追加するだけ
- 仕様変更: 該当feature内で完結
- 横断仕様: shared or external層に整理

## 9. データフロー（詳細: RSC + Server Actions + TanStack Query）
要点: 初期表示はRSC、更新はServer Actions + TanStack Queryで統一し、読み書きの経路を固定します。
TanStack Queryはサーバー状態の取得・キャッシュ・再取得を一貫して扱えるため、
useStateなどで個別にデータ管理するよりも予期せぬエラーを避けやすいというメリットがあります。
そのため、データフェッチ用途でのuseState運用は基本的に行いません。

### 9.1 全体フロー

```
Page (RSC)
  ↓
Feature Template
  ↓
Client Component (Container)
  ↓
Server Action
  ↓
External Service
  ↓
DB / API
```

- **初期表示**はRSCでサーバー側から取得し、HTMLに埋め込む
- **クライアント更新**はTanStack Queryで再取得とキャッシュを制御
- **書き込み**はServer Actionsに集約し、権限チェックと入力検証を統一

### 9.2 RSCでの初期データ取得（Prefetch）
Server Componentのテンプレートで事前取得し、Hydrationで引き継ぎます。

```
RSC Template
  ↓ prefetchQuery()
HydrationBoundary
  ↓
Client Component
```

初期表示のレスポンスを高速化し、クライアントでの二重取得を防ぎます。

### 9.3 Client Query（読み取り）
- **クエリキーを一元管理**してキャッシュ境界を明確化
- **queryFnはServer Action**を使用し、認証とデータ取得の責務を分離

```
useQuery
  ↓
listWorkoutRecordsAction({ from, to })
```

### 9.4 Mutation（書き込み）
- **create/update/delete**はServer Actionに集約
- 成功後は関連クエリのみinvalidateして再取得

```
useMutation
  ↓
createWorkoutRecordAction(input)
  ↓
invalidateQueries(workoutKeys.lists())
```

### 9.5 キャッシュ方針
- `staleTime=0` でRSCのデータを常に優先
- `gcTime=5分` で過剰な再取得を抑制

## 10. External層設計
要点: DB直結でもAPI連携でも、Handler/UIの変更を最小化できる境界を提供します。
External層は「MVP -> Growthでの変更点最小化」のための設計です。
DB直結でもAPI連携でも、呼び出し側のコードを変えずに移行できることを目的とします。

```
external/
├─ dto/          # API契約（入出力の型）
├─ handler/      # CQRSエントリーポイント
├─ service/      # ビジネスロジック / 外部呼び出し
└─ client/       # DB/HTTPクライアント
```

### 10.1 DTO（契約の固定）
- 入出力のスキーマをZodで定義
- DB/APIが変わってもDTOの形は維持
- 変更が必要な場合はDTOの変更のみで影響範囲を限定

### 10.2 Handler（CQRSの入口）
Handlerは「呼び出し元に応じた入口を用意し、責務を段階的に分離する」ための層です。
ClientとRSCで入口を分け、共通のServer Functionに集約することで、認証・検証・実処理の
流れが一貫します。

```
Client Component
  ↓
Server Action（認証のみ）
  ↓
Command/Query（バリデーション + Service呼び出し）
```

#### 命名規則（外部連携層）
- **Query（読み取り）**: `*.query.server.ts`
- **Command（書き込み）**: `*.command.server.ts`
- **Action（クライアント呼び出し）**: `*.action.ts`

#### 役割分担（つながり）
- **Server Action** は「クライアントの入口」。認証チェックだけを行い、処理をServer Functionへ渡す。
- **Server Function（Command/Query）** は「共通の実処理」。入力検証とService呼び出しをここで完結させる。

#### 呼び出し元ごとのルール
- **Client Component**: `*Action` のみ使用  
- **Server Component (RSC)**: `*Query/*Command` のみ使用  

#### 目的
- 認証・入力検証・ビジネスロジックの責務分離
- RSCとClient双方からの呼び出し経路を明確化
- 将来のAPI移行や認証方式変更の影響を局所化

### 10.3 Service（差し替え点）
Serviceは「DB直結」か「API呼び出し」かを内部で切り替えます。
呼び出し側は`workoutService`のインターフェースだけを利用します。

```
Handler → workoutService → DB (現在)
Handler → workoutService → API (将来)
```

### 10.4 Client（外部接続の集約）
- DB接続やHTTPクライアントをここに集約
- 通信方式や接続先が変わってもServiceより上の層に影響しない

### 10.5 API移行時の変更点（要約）
- **追加**: API用client/実装（例: `workout.api.ts`）
- **切替**: Service内部のデータソース設定
- **不要**: HandlerやUIの修正

## 11. 認証設計（BFFとしてのNext.js）
認証責務はNext.js側に集約し、バックエンドは信頼された呼び出し元として扱います。

- Better Auth + Google OAuth
- customSessionで`account`情報を付与
- `(authenticated)` layoutで認証必須化

```
(authenticated) layout
  ↓
requireAuthServer()
  ↓
session (user + account)
```
