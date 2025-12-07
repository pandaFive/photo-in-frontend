# Photo-in Frontend

撮影タスク自動割り振りアプリケーションのフロントエンドプロジェクト

## 技術スタック

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: Material-UI (MUI) v5
- **Charts**: MUI X Charts, Recharts
- **State Management**: React Hooks (useState, useEffect, useCallback, useMemo)
- **File Upload**: AWS SDK v3 (S3 Client)
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library
- **Package Manager**: npm

## プロジェクト構造

```
src/
├── api/                    # Server Actions (外部API呼び出し)
│   ├── get-account-status.ts
│   ├── get-areas.ts
│   ├── get-week-complete.ts
│   └── ...
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理者専用ページ
│   │   ├── account/       # アカウント管理
│   │   ├── dashboard/     # ダッシュボード
│   │   └── members/       # メンバー管理
│   ├── (member)/          # メンバー専用ページ
│   │   └── tasks/         # タスク一覧
│   ├── api/               # Route Handlers
│   │   ├── aws/           # S3署名付きURL生成
│   │   ├── comment/       # コメントAPI
│   │   └── ...
│   └── login/             # ログインページ
├── components/            # Reactコンポーネント
│   ├── Buttons/          # ボタンコンポーネント
│   ├── Details/          # タスク詳細コンポーネント
│   ├── Chart.tsx         # 週間完了チャート
│   ├── CommentList.tsx   # コメント一覧（DataGrid）
│   ├── TaskList.tsx      # タスク一覧
│   └── ...
├── types/                 # TypeScript型定義
│   └── index.ts          # 共通型定義
├── util/                  # ユーティリティ関数
│   ├── actions/          # クライアント側fetch関数
│   ├── fetch-comment.ts  # コメントAPI共通関数
│   ├── format-date.ts    # 日付フォーマット
│   └── grouping.ts       # タスクグループ化
└── __tests__/            # テストファイル
    └── components/       # コンポーネントテスト
```

## セットアップ

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

### インストール

```bash
npm install
```

### 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定：

```env
# AWS S3設定
REGION=ap-northeast-1
ACCESS_KEY=your_access_key
SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name

# バックエンドAPI
API_HOST=http://localhost:3001
NEXT_PUBLIC_API_HOST=http://localhost:3001
```

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint

# コードフォーマット確認
npm run prettier:check

# コードフォーマット適用
npm run prettier:write

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# テストカバレッジ
npm run test:coverage
```

## 主要機能

### 管理者機能
- ダッシュボード（週間完了タスクチャート、統計表示）
- アカウント作成・削除
- メンバー管理・詳細表示
- タスク管理（全タスク、NGタスクの閲覧）
- タスクの再アサイン
- コメント機能

### メンバー機能
- アサインされたタスクの確認
- タスクの完了/NG登録
- コメント機能
- タスクのソート（日付/エリア別）

### ファイルアップロード
- PDFファイルのS3アップロード
- 署名付きURLによる安全なファイルアクセス
- エリア名によるファイルフィルタリング

## パフォーマンス最適化

このプロジェクトでは以下のパフォーマンス最適化を実施しています：

### 1. キャッシング戦略
- Next.js `revalidate` を活用したデータキャッシング
- タスクデータ: 60秒キャッシュ
- 統計データ: 300秒（5分）キャッシュ

### 2. コンポーネント最適化
- `useMemo` によるメモ化（TaskList, CommentList）
- `useCallback` によるハンドラメモ化
- React.memoによる不要な再レンダリング防止

### 3. 並列データフェッチ
- Promise.allによるファイルURLとコメントの並列取得
- AbortControllerによるメモリリーク対策

### 4. アルゴリズム最適化
- ファイルフィルタリング: O(n²) → O(n) (Set使用)
- 重複チェックの高速化

## コード品質

### リファクタリング実施内容

1. **型定義の集約** (`src/types/index.ts`)
   - ErrorResponse、ApiResultの一元化
   - 循環依存リスクの解消

2. **エラーハンドリングの統一**
   - 共通fetchラッパー関数の実装
   - 一貫したエラーメッセージ

3. **Import構造の統一**
   - 相対パスから絶対パス（`@/src/`）への変更
   - 保守性の向上

4. **ドキュメント化**
   - JSDocコメントの追加
   - 複雑なロジックへの説明追加

## テスト

テストファイルは `src/__tests__/` に配置されています。

```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test -- CommentList.test.tsx

# カバレッジレポート生成
npm run test:coverage
```

主要なテスト対象：
- TaskList コンポーネント
- CommentList コンポーネント
- Chart コンポーネント
- ユーティリティ関数

## デプロイ

### AWS Amplify

このプロジェクトはAWS Amplifyを使用した自動デプロイに対応しています。

```bash
# ビルド
npm run build

# 本番環境の確認
npm start
```

Amplifyの設定は `amplify.yml` を参照してください。

## トラブルシューティング

### ビルドエラー

型エラーが発生する場合：
```bash
npm run lint
```

### キャッシュクリア

開発中に問題が発生した場合：
```bash
rm -rf .next
npm run dev
```

## 貢献

1. 新機能追加時はテストを追加してください
2. コミット前に `npm run lint` と `npm run prettier:write` を実行してください
3. 型定義は `src/types/index.ts` に集約してください
4. Import は絶対パス（`@/src/`）を使用してください

## ライセンス

このプロジェクトはプライベートプロジェクトです。

## 関連リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- バックエンドリポジトリ: `photo-in-backend`
