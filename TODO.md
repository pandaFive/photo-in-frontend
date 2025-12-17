# FP境界分離アーキテクチャ 残作業TODO

## 優先度: 高

（なし - Phase 4完了）

---

## 優先度: 中

（なし - Server Actions統一完了）

---

## 優先度: 低

### 1. エラー表示UI改善
- [ ] トースト通知コンポーネント追加
- [ ] mutation失敗時のユーザー通知
- [ ] ネットワークエラー時のリトライUI

---

## 完了済み

### Phase 1-2: 基盤整備
- [x] `src/domain/types/error.ts` - Result型、DomainError
- [x] `src/infra/http/client.ts` - 統一HTTPクライアント（クライアント用）
- [x] `src/api/tasks/fetchers.ts` - SWR fetcher
- [x] `src/queries/useTaskList.ts` - タスク一覧query
- [x] `src/mutations/useTaskMutation.ts` - タスクmutation

### Phase 3: Date/Time純粋化
- [x] `src/domain/functions/date.ts` - Date純粋関数
- [x] `src/infra/time/index.ts` - Date I/O
- [x] Copyright, Footer, Chart, grouping更新

### Phase 4: 横展開
- [x] `src/mutations/useCommentMutation.ts` - コメントmutation
- [x] `src/queries/useTaskDetail.ts` - タスク詳細query
- [x] `src/mutations/useFileUpload.ts` - ファイルアップロード（httpClient.postFormData使用）
- [x] `src/mutations/useAccountMutation.ts` - アカウントmutation
- [x] TaskAccordion, CommentList, UploadButton, MemberCard更新
- [x] `src/queries/useWeekComplete.ts` - 週間完了データquery
- [x] Chart.tsx SWR Query化（useEffect内fetch → useWeekComplete使用）

### Server Actions統一
- [x] `src/infra/http/serverClient.ts` - Server Actions用HTTPクライアント
- [x] `get-account-status.ts` - serverHttpClient化
- [x] `get-account-tasks.ts` - serverHttpClient化
- [x] `get-account.ts` - serverHttpClient化
- [x] `get-areas.ts` - serverHttpClient化
- [x] `get-tasks.ts` - serverHttpClient化
- [x] `get-unfulfilled-count.ts` - serverHttpClient化
- [x] `get-week-complete.ts` - serverHttpClient化
- [x] `post-login.ts` - serverHttpClient化
- [x] `post-signup.ts` - serverHttpClient化
- [x] `post-task-create.ts` - serverHttpClient化

### Phase 5: テスト整備
- [x] `src/domain/functions/date.ts` - 純粋関数テスト（21件）
- [x] `src/infra/http/client.ts` - httpClientテスト（16件）
- [x] `src/infra/http/serverClient.ts` - serverHttpClientテスト（12件）
- [x] `src/mutations/useCommentMutation.ts` - hookテスト（8件）
- [x] `src/mutations/useFileUpload.ts` - hookテスト（9件）
- [x] `src/mutations/useAccountMutation.ts` - hookテスト（5件）
- [x] `src/queries/useTaskList.ts` - hookテスト（12件）
- [x] `src/queries/useTaskDetail.ts` - hookテスト（11件）
- [x] `src/queries/useWeekComplete.ts` - hookテスト（13件）
- [x] `src/mutations/useTaskMutation.ts` - hookテスト（16件）

### クリーンアップ
- [x] `src/util/fetch-comment.ts` 削除 - useCommentMutationに置換
- [x] `src/util/hooks/useTaskListData.ts` 削除 - useTaskListに置換
- [x] `src/util/swr/fetcher.ts` 削除 - taskListFetcherに置換
- [x] `src/__tests__/components/CommentList.test.tsx` - モック更新
- [x] `src/mutations/useFileUpload.ts` - httpClient.postFormData化
- [x] `src/__tests__/components/Chart.test.tsx` - useWeekCompleteモック更新

---

## アーキテクチャ図

```
UI (components, app)
    ↓ (hooks経由)
queries / mutations
    ↓ (fetcher経由)
api (adapters, fetchers)
    ↓ (client経由)
infra (http, time)
  ├── httpClient (クライアント用)
  └── serverHttpClient (Server Actions用)

domain ← 全層から参照可能（逆方向禁止）
```

## テストカバレッジ

| カテゴリ | テスト数 |
|---------|---------|
| domain/functions/date | 21件 |
| infra/http/client | 16件 |
| infra/http/serverClient | 12件 |
| queries/useTaskList | 12件 |
| queries/useTaskDetail | 11件 |
| queries/useWeekComplete | 13件 |
| mutations/useCommentMutation | 8件 |
| mutations/useFileUpload | 9件 |
| mutations/useAccountMutation | 5件 |
| mutations/useTaskMutation | 16件 |
| コンポーネント | 52件 |
| **合計** | **175件** |
