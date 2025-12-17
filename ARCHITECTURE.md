# ARCHITECTURE.md

Photo-In Frontend のアーキテクチャ設計書

## 概要

本プロジェクトは Next.js 14 (App Router) を基盤とした撮影タスク管理アプリケーションのフロントエンドです。関数型プログラミングの原則に基づき、純粋な処理（domain）と副作用を伴う処理（infra）を明確に分離しています。

---

## ディレクトリ構造

```
src/
├── api/                    # Server Actions & Fetchers
│   ├── get-*.ts           # データ取得用 Server Actions
│   ├── post-*.ts          # データ更新用 Server Actions
│   └── tasks/fetchers.ts  # SWR用フェッチャー（エラーハンドリング付き）
│
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理者用ルートグループ
│   │   ├── dashboard/     # ダッシュボード
│   │   ├── account/       # アカウント管理
│   │   ├── members/       # メンバー一覧
│   │   └── task/          # タスク管理
│   ├── (member)/          # メンバー用ルートグループ
│   │   └── member/[id]/   # メンバー個別ページ
│   ├── api/               # Route Handlers（APIブリッジ）
│   │   ├── account/       # アカウントAPI
│   │   ├── tasks/         # タスクAPI
│   │   ├── aws/           # S3ファイル操作
│   │   └── comment/       # コメントAPI
│   └── layout.tsx         # ルートレイアウト（プロバイダー設定）
│
├── components/             # UIコンポーネント（クライアント）
│   ├── TaskList.tsx       # タスク一覧（ソート・フィルタ）
│   ├── CommentList.tsx    # コメントDataGrid（CRUD）
│   ├── TaskAccordion.tsx  # タスク詳細アコーディオン
│   ├── Chart.tsx          # 週間完了チャート
│   ├── AppBar.tsx         # ヘッダー（認証情報表示）
│   ├── Drawer.tsx         # サイドナビゲーション
│   └── Buttons/           # ボタンコンポーネント群
│
├── context/                # React Context
│   └── ToastContext.tsx   # グローバルトースト通知
│
├── domain/                 # 純粋なビジネスロジック（I/O禁止）
│   ├── types/
│   │   ├── error.ts       # Result<T>型、DomainError定義
│   │   └── index.ts       # エラーヘルパー関数
│   └── functions/
│       └── date.ts        # 純粋な日付処理関数
│
├── infra/                  # インフラ層（I/O操作）
│   ├── http/
│   │   ├── client.ts      # ブラウザ用HTTPクライアント
│   │   ├── serverClient.ts # サーバー用HTTPクライアント
│   │   └── index.ts       # エクスポート
│   └── time/
│       └── index.ts       # 時間I/O（getNow, getCurrentYear）
│
├── mutations/              # 更新系Hooks（SWR Mutation）
│   ├── useTaskMutation.ts # タスク: 完了/NG/再割当
│   ├── useFileUpload.ts   # ファイルアップロード（進捗表示）
│   ├── useCommentMutation.ts # コメント: CRUD
│   └── useAccountMutation.ts # アカウント操作
│
├── queries/                # 読み取り系Hooks（SWR Query）
│   ├── useTaskList.ts     # タスク一覧（dataType切替）
│   ├── useTaskDetail.ts   # タスク詳細（遅延読み込み）
│   ├── useWeekComplete.ts # 週間チャートデータ
│   └── index.ts           # エクスポート
│
├── types/                  # グローバル型定義
│   └── index.ts           # Task, Comment, AccountData等
│
├── util/                   # ユーティリティ
│   ├── actions/           # 認証系Server Actions
│   │   ├── login.ts       # ログイン
│   │   ├── logout.ts      # ログアウト
│   │   └── signUp.ts      # サインアップ
│   ├── swr/keys.ts        # SWRキャッシュキー一元管理
│   ├── cookies.ts         # Cookie操作
│   ├── is-admin.ts        # 管理者判定
│   ├── is-member.ts       # メンバー判定
│   └── grouping.ts        # タスクグルーピング
│
└── __tests__/              # Jestテスト
    ├── queries/           # Queryフックテスト
    ├── mutations/         # Mutationフックテスト
    ├── domain/functions/  # ドメイン関数テスト
    └── infra/http/        # HTTPクライアントテスト
```

---

## レイヤーアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (components/, app/)              │
│                     React Components                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Hooks Layer (queries/, mutations/)          │
│              SWR Query Hooks / Mutation Hooks                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (api/)                          │
│            Server Actions / SWR Fetchers                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer (infra/)                 │
│              HTTP Client / Time I/O                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Domain Layer (domain/)                      │
│        純粋な型定義・関数（全層から参照可能）                  │
└─────────────────────────────────────────────────────────────┘
```

### レイヤー責務

| レイヤー | 責務 | I/O | 例 |
|---------|------|-----|-----|
| **domain** | 純粋な型定義・ビジネスロジック | 禁止 | Result型、日付計算 |
| **infra** | I/O操作のラッパー | 許可 | httpClient、getNow() |
| **api** | Server Actions、SWR fetcher | 許可 | get-tasks.ts |
| **queries** | SWR読み取りhooks | 間接的 | useTaskList |
| **mutations** | 更新系hooks | 間接的 | useTaskMutation |
| **components** | UIコンポーネント | hooks経由 | TaskList |

---

## データフローパターン

### 読み取りフロー（Query）

```
Component (useTaskList呼び出し)
    │
    ▼
SWR Query Hook (キャッシュ確認・再検証)
    │
    ▼
SWR Fetcher (taskListFetcher)
    │
    ▼
HTTP Client (httpClient.get → Result<T>)
    │
    ▼
Route Handler or Server Action
    │
    ▼
Backend API (Rails)
```

### 更新フロー（Mutation）

```
User Action (ボタンクリック等)
    │
    ▼
Component Handler (onClick)
    │
    ▼
Mutation Hook (useTaskMutation.completeTask)
    │
    ▼
HTTP Client (httpClient.put → Result<T>)
    │
    ▼
Route Handler (/api/tasks/complete)
    │
    ▼
Backend API (Rails)
    │
    ▼
SWR Cache Invalidation (mutate())
```

---

## 主要パターン

### 1. Result型パターン（Railway-Oriented Programming）

全てのHTTPリクエストは明示的なエラーハンドリングを強制する `Result<T>` 型を返します。

```typescript
// src/domain/types/error.ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: DomainError };

type DomainError = ApiError | NetworkError;

type ApiError = {
  type: 'api';
  status: number;
  message: string;
};

type NetworkError = {
  type: 'network';
  message: string;
};
```

**使用例:**

```typescript
const result = await httpClient.get<Task[]>('/api/tasks');

if (result.ok) {
  // result.value: Task[]
  return result.value;
} else {
  // result.error: DomainError
  console.error(toDisplayError(result.error));
}
```

### 2. Mutation Hookパターン

```typescript
// src/mutations/useTaskMutation.ts
export const useTaskMutation = (mutate: ReturnType<typeof useSWR>['mutate']) => {
  const pendingTasksRef = useRef<Set<number>>(new Set());

  const completeTask = async (taskId: number, historyId: number) => {
    // 重複実行防止
    if (pendingTasksRef.current.has(taskId)) {
      return { success: false, error: '処理中です' };
    }

    pendingTasksRef.current.add(taskId);

    try {
      const result = await httpClient.put(`/api/task/${historyId}/complete`);

      if (result.ok) {
        await mutate(); // キャッシュ更新
        return { success: true };
      }
      return { success: false, error: result.error.message };
    } finally {
      pendingTasksRef.current.delete(taskId);
    }
  };

  return { completeTask, markAsNG, reassign, isPending };
};
```

**特徴:**
- 重複実行防止（pendingTasksRef）
- 楽観的更新（UIを先に更新）
- エラー時ロールバック
- Result型による明示的エラーハンドリング

### 3. Query Hookパターン

```typescript
// src/queries/useTaskList.ts
export const useTaskList = ({ account, id }: Props): UseTaskListReturn => {
  const [dataType, setDataType] = useState<DataType>('active');

  // 条件に応じたSWRキー
  const swrKey = dataType === 'NG'
    ? SWR_KEYS.ngTasks
    : account.role === 'member'
      ? SWR_KEYS.memberTasks(String(id))
      : SWR_KEYS.allTasks;

  const { data = [], error, isLoading, mutate } = useSWR<Task[], TaskFetchError>(
    swrKey,
    taskListFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2000,
    }
  );

  return {
    data,
    dataType,
    isLoading,
    error: error ? toDisplayError(error.domainError) : null,
    changeDataType: setDataType,
    mutate,
  };
};
```

### 4. 遅延読み込みパターン（useTaskDetail）

アコーディオン展開時にのみデータを取得する最適化パターン。

```typescript
// src/queries/useTaskDetail.ts
export const useTaskDetail = () => {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDetail = async (taskId: number) => {
    // 既存リクエストをキャンセル
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const [fileResult, commentsResult] = await Promise.all([
      httpClient.get(`/api/aws?key=${taskId}`, { signal }),
      httpClient.get(`/api/comment/${taskId}`, { signal }),
    ]);

    // ... 結果処理
  };

  return { detail, fetchDetail, clearDetail };
};
```

### 5. Server Actionパターン

```typescript
// src/api/get-tasks.ts
'use server';

export async function getTasks(): Promise<Task[]> {
  const result = await serverHttpClient.get<TaskApiResponse[]>('/tasks', {
    revalidate: 60, // ISR: 60秒間キャッシュ
  });

  if (result.ok) {
    return result.value.map(transformTask);
  }

  console.error('Failed to fetch tasks:', result.error);
  return [];
}
```

---

## 状態管理

### SWR（Stale-While-Revalidate）

- **読み取り**: SWR hooksでキャッシュ・再検証を自動管理
- **更新**: Mutation後に `mutate()` でキャッシュ無効化
- **キー管理**: `src/util/swr/keys.ts` で一元管理

```typescript
// src/util/swr/keys.ts
export const SWR_KEYS = {
  allTasks: '/api/tasks',
  ngTasks: '/api/tasks/ng',
  memberTasks: (id: string) => `/api/tasks/member/${id}`,
  weekComplete: '/api/completed-data',
};
```

### ローカル状態

- `useState`: UIの状態（ソート順、フィルタ、フォーム入力）
- `useRef`: 命令的操作（AbortController、重複防止Set）
- `useMemo`: 高コストな計算のメモ化

### グローバル状態

- **ToastContext**: アプリ全体のトースト通知
- **Cookies**: JWTトークン（HttpOnly、24時間有効）

---

## 認証フロー

```
ログインページ
    │
    ▼ loginAction (Server Action)
postLogin(name, password)
    │
    ▼ serverHttpClient.post
/account/login (Backend)
    │
    ▼
setCookies('token', result.token)
    │
    ▼
redirect('/dashboard' or '/member/${id}')
```

### 認証関連ファイル

| ファイル | 責務 |
|---------|------|
| `util/actions/login.ts` | ログインServer Action |
| `util/actions/logout.ts` | ログアウトServer Action |
| `util/cookies.ts` | Cookie操作 |
| `api/get-account.ts` | 現在のユーザー取得 |
| `util/is-admin.ts` | 管理者判定 |
| `util/is-member.ts` | メンバー判定 |

---

## ファイルアップロード

### アーキテクチャ

```
Component (useFileUpload)
    │
    ▼
httpClient.postFormData('/api/aws', formData)
    │
    ▼
Route Handler (/api/aws/route.ts)
    │
    ▼
AWS S3 Client
    │
    ▼
S3 Bucket (署名付きURL返却)
```

### バリデーション

- **ファイル形式**: PDF, JPEG, PNG
- **サイズ上限**: 10MB
- **アクセス制御**: プライベートACL + 署名付きURL

### 進捗管理

```typescript
// src/mutations/useFileUpload.ts
type UploadProgress = {
  isUploading: boolean;
  currentFile: string | null;
  uploadedCount: number;
  totalCount: number;
};
```

---

## エラーハンドリング

### 4層のエラー処理

1. **Infrastructure層** (`infra/http/client.ts`)
   - ネットワークエラー → `NetworkError`
   - HTTPエラー → `ApiError`（ステータスコード付き）
   - `Result<T>` で返却

2. **API層** (`api/tasks/fetchers.ts`)
   - `DomainError` を `TaskFetchError` でラップ
   - 型ガード: `isTaskFetchError(error)`

3. **Query/Mutation層**
   - `result.ok` チェック
   - `toDisplayError()` で表示用文字列に変換

4. **Component層**
   - `useToast().showError(message)` で表示
   - `showErrorWithRetry(message, onRetry)` でリトライUI

### エラー表示関数

```typescript
// src/domain/types/error.ts
export const toDisplayError = (error: DomainError): string => {
  switch (error.type) {
    case 'api':
      return `エラー (${error.status}): ${error.message}`;
    case 'network':
      return `ネットワークエラー: ${error.message}`;
  }
};
```

---

## テスト戦略

### テスト分類

| 種別 | 場所 | 対象 |
|------|------|------|
| 単体テスト | `__tests__/domain/` | 純粋関数 |
| 統合テスト | `__tests__/queries/` | Query hooks |
| 統合テスト | `__tests__/mutations/` | Mutation hooks |
| 統合テスト | `__tests__/infra/` | HTTPクライアント |

### テストパターン

```typescript
// モック
jest.mock('@/src/infra/http', () => ({
  httpClient: { get: jest.fn() },
}));

// Result型でテスト
const result = { ok: true, value: mockData };
(httpClient.get as jest.Mock).mockResolvedValue(result);
```

---

## 設計原則

### 関数型プログラミングの境界

- **domain/**: 純粋関数のみ（`new Date()` 禁止、引数で受け取る）
- **infra/**: I/O操作をラップ（テスト時にモック可能）

### 依存性注入

```typescript
// 純粋関数（domain）
const dates = getDatesForPastWeek(now); // Dateを引数で受け取る

// I/O関数（infra）
const now = getNow(); // 実際のI/O
```

### コンポーネント設計

- Props経由のデータ受け渡し
- Hooksで副作用を分離
- `useMemo`/`useCallback` でパフォーマンス最適化
- UIロジックとデータロジックの分離

---

## 主要ファイルリファレンス

| ファイル | 責務 |
|---------|------|
| `domain/types/error.ts` | Result型、エラーヘルパー |
| `infra/http/client.ts` | ブラウザ用HTTPクライアント |
| `infra/http/serverClient.ts` | サーバー用HTTPクライアント |
| `queries/useTaskList.ts` | タスク一覧Query例 |
| `mutations/useTaskMutation.ts` | タスクMutation例 |
| `mutations/useFileUpload.ts` | ファイルアップロード |
| `context/ToastContext.tsx` | グローバルトースト |
| `api/get-tasks.ts` | Server Action例 |
| `app/api/aws/route.ts` | S3操作Route Handler |
| `util/swr/keys.ts` | SWRキー一元管理 |
| `domain/functions/date.ts` | 純粋な日付関数 |

---

## アーキテクチャの強み

1. **明確な境界分離**: 純粋（domain）と副作用（infra）の分離
2. **型安全性**: Result<T>パターンによるエラーの明示化
3. **再利用性**: Hooks + Server Actionsによるロジック分離
4. **パフォーマンス**: メモ化、SWR重複排除、遅延読み込み、ISR
5. **テスタビリティ**: 純粋関数、依存性注入、モック可能なI/O
6. **保守性**: 一貫したエラーハンドリング、統一パターン
7. **開発体験**: 絶対パスインポート（`@/src/`）、整理された構造
