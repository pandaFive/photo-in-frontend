# フロントエンドAPI仕様書

**作成日**: 2025-12-30
**最終更新**: 2025-12-30

---

## 概要

Photo-in Frontendが提供するRoute Handlers（Next.js API Routes）の仕様書です。
これらのエンドポイントはバックエンドAPIへのプロキシとして機能し、認証・認可・バリデーションを担当します。

### 認証方式

すべてのエンドポイントはJWT認証が必要です。
トークンはCookieから取得され、バックエンドへの`Authorization: Bearer <TOKEN>`ヘッダーとして転送されます。

### 共通エラーレスポンス

```typescript
type ErrorResponse = {
  errors: string[];
}
```

| ステータス | 説明 |
|-----------|------|
| 400 | バリデーションエラー（不正なID、必須パラメータ不足等） |
| 401 | 認証エラー（トークンなし/無効） |
| 403 | 認可エラー（権限不足） |
| 500 | サーバーエラー |
| 502 | バックエンドからの不正なレスポンス |

---

## エンドポイント一覧

| エンドポイント | メソッド | 認可 | 説明 |
|---------------|---------|------|------|
| `/api/account/[id]` | DELETE | Admin | アカウント削除 |
| `/api/account/[id]/tasks` | GET | Auth | アカウントの担当タスク一覧 |
| `/api/areas` | GET | Auth | エリア一覧取得 |
| `/api/aws` | GET | Auth | S3署名付きURL取得 |
| `/api/aws` | POST | Auth | ファイルアップロード |
| `/api/comment` | POST | Auth | コメント作成 |
| `/api/comment` | PUT | Auth | コメント更新 |
| `/api/comment` | DELETE | Auth | コメント削除 |
| `/api/comments` | GET | Auth | コメント一覧取得 |
| `/api/task/[id]/complete` | PUT | Auth | タスク完了 |
| `/api/task/[id]/ng` | PUT | Auth | タスクNG |
| `/api/task/[id]/reassign` | PUT | Auth | タスク再割り当て |
| `/api/tasks/all` | GET | Auth | 全タスク一覧 |
| `/api/tasks/ng` | GET | Auth | NGタスク一覧 |

---

## アカウント関連

### DELETE /api/account/[id]

アカウントを削除します。管理者権限が必要です。

**パスパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| id | number | Yes | アカウントID（正の整数） |

**レスポンス**

```typescript
// 成功（200）
type ResponseStatus = {
  [key: string]: string;
}

// 例
{ "message": "deleted" }
```

---

### GET /api/account/[id]/tasks

指定アカウントのアサイン済みタスク一覧を取得します。

**パスパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| id | number | Yes | アカウントID（正の整数） |

**レスポンス**

```typescript
// 成功（200）
type TaskListItem = {
  id: number;
  task_title: string;
  area_name: string;
  created_at: string;      // ISO 8601
  history_id: number;
  assign_cycle_id: number;
}

// 配列で返却
TaskListItem[]
```

**キャッシュ**

```
Cache-Control: private, max-age=10, stale-while-revalidate=30
```

---

## エリア関連

### GET /api/areas

全エリア一覧を取得します。

**レスポンス**

```typescript
// 成功（200）
type Area = {
  id: number;
  name: string;
}

// 配列で返却
Area[]
```

**キャッシュ**

```
Cache-Control: private, max-age=10, stale-while-revalidate=30
```

---

## ファイル関連（AWS S3）

### GET /api/aws

S3オブジェクトの署名付きURLを取得します。

**クエリパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| key | string | Yes | S3オブジェクトキー |

**バリデーション**

- パストラバーサル攻撃の検出（`..`、`//`、先頭`/`を禁止）

**レスポンス**

```typescript
// 成功（200）
string  // 署名付きURL（有効期限: 2時間）
```

---

### POST /api/aws

ファイルをS3にアップロードし、タスクを作成します。

**リクエスト**

- Content-Type: `multipart/form-data`

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| file | File | Yes | アップロードするファイル |

**バリデーション**

| 項目 | 制限 |
|-----|------|
| ファイルサイズ | 最大10MB |
| 許可MIMEタイプ | `application/pdf`, `image/jpeg`, `image/png` |
| マジックバイト検証 | Content-Type偽装対策として実施 |
| ファイル名サニタイズ | パストラバーサル防止 |

**レスポンス**

```typescript
// 成功（200）
{
  url: string;       // 署名付きURL
  fileName: string;  // サニタイズ後のファイル名
}
```

---

## コメント関連

### GET /api/comments

タスクに紐づくコメント一覧を取得します。

**クエリパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| taskId | number | Yes | タスクID（正の整数） |
| accountId | number | Yes | アカウントID（正の整数） |

**レスポンス**

```typescript
// 成功（200）
type Comment = {
  id: number;
  name: string;
  content: string;
  taskId: number;
  updatedAt: string;    // ISO 8601
  accountName: string;
  role: string;
}

// 配列で返却
Comment[]
```

**キャッシュ**

```
Cache-Control: private, max-age=10, stale-while-revalidate=30
```

---

### POST /api/comment

コメントを作成します。

**リクエストボディ**

```typescript
{
  content: string;   // コメント内容（空文字不可）
  taskId: number;    // タスクID（正の整数）
}
```

**レスポンス**

```typescript
// 成功（200）
Comment
```

---

### PUT /api/comment

コメントを更新します。

**リクエストボディ**

```typescript
{
  id: number;        // コメントID（正の整数）
  content: string;   // コメント内容（空文字不可）
}
```

**レスポンス**

```typescript
// 成功（200）
Comment
```

---

### DELETE /api/comment

コメントを削除します。

**クエリパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| commentId | number | Yes | コメントID（正の整数） |

**レスポンス**

```typescript
// 成功（200）
type CommentApiResponse = {
  message: string;
}
```

---

## タスク関連

### GET /api/tasks/all

全タスク一覧を取得します（管理者向け）。

**レスポンス**

```typescript
// 成功（200）
type TaskListItem = {
  id: number;
  task_title: string;
  area_name: string;
  created_at: string;
  history_id: number;
  assign_cycle_id: number;
}

// 配列で返却
TaskListItem[]
```

**キャッシュ**

```
Cache-Control: private, max-age=10, stale-while-revalidate=30
```

---

### GET /api/tasks/ng

NGタスク一覧を取得します。

**レスポンス**

```typescript
// 成功（200）
TaskListItem[]
```

**キャッシュ**

```
Cache-Control: private, max-age=10, stale-while-revalidate=30
```

---

### PUT /api/task/[id]/complete

タスクを完了状態にします。

**パスパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| id | number | Yes | タスクID（正の整数） |

**レスポンス**

```typescript
// 成功（200）
{
  message: string;
  result: boolean;
}
```

---

### PUT /api/task/[id]/ng

タスクをNG状態にします。

**パスパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| id | number | Yes | タスクID（正の整数） |

**レスポンス**

```typescript
// 成功（200）
{
  message: string;
  result: boolean;
}
```

---

### PUT /api/task/[id]/reassign

タスクを再割り当て（新しいサイクル）します。

**パスパラメータ**

| 名前 | 型 | 必須 | 説明 |
|-----|-----|------|------|
| id | number | Yes | タスクID（正の整数） |

**レスポンス**

```typescript
// 成功（200）
type TaskDetail = {
  id: number;
  task_title: string;
  area_name: string;
  area_id: number;
  created_at: string;
  updated_at: string;
}
```

---

## 型定義リファレンス

詳細な型定義は `src/types/index.ts` を参照してください。

| 型名 | 用途 |
|-----|------|
| `TaskListItem` | アサイン済みタスク一覧（history_id, assign_cycle_id含む） |
| `ActiveTask` | 管理者向け全タスク一覧（assign_cycle_idのみ） |
| `TaskDetail` | タスク詳細/作成/更新レスポンス |
| `Comment` | コメント |
| `Area` | エリア |
| `ErrorResponse` | エラーレスポンス |

---

## セキュリティ考慮事項

### 認証・認可

- 全エンドポイントでJWT認証を実施（`requireAuth()`）
- 管理者専用エンドポイントは`requireAdmin()`で認可チェック
- **重要**: フロントエンドの認可チェックはUX向上目的であり、バックエンドでも必ず認可チェックが必要

### 入力バリデーション

- IDパラメータは`requireValidId()`で検証（正の整数、境界値チェック）
- ファイルアップロードはMIMEタイプ、サイズ、マジックバイトを検証
- S3キーはパストラバーサル攻撃を検出

### ログ出力

- エラー発生時は`logError()`でサニタイズしてログ出力
- 機密情報（トークン等）はログに出力しない
