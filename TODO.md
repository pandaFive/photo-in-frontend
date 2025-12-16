# FP境界分離アーキテクチャ 残作業TODO

## 優先度: 高

（なし - Phase 4完了）

---

## 優先度: 中

### 1. Server Actions統一（src/api/*.ts）
現在は直接fetchを使用、httpClient統一は任意
- `get-account-status.ts`
- `get-account-tasks.ts`
- `get-account.ts`
- `get-areas.ts`
- `get-tasks.ts`
- `get-unfulfilled-count.ts`
- `get-week-complete.ts`
- `post-login.ts`
- `post-signup.ts`
- `post-task-create.ts`

---

## 優先度: 低

### 2. Phase 5: テスト整備
- [ ] `src/domain/functions/date.ts` - 純粋関数テスト追加
- [ ] `src/infra/http/client.ts` - httpClientテスト（MSW使用）
- [ ] `src/queries/useTaskList.ts` - hookテスト
- [ ] `src/queries/useTaskDetail.ts` - hookテスト
- [ ] `src/queries/useWeekComplete.ts` - hookテスト
- [ ] `src/mutations/useTaskMutation.ts` - hookテスト
- [ ] `src/mutations/useCommentMutation.ts` - hookテスト
- [ ] `src/mutations/useFileUpload.ts` - hookテスト

### 3. エラー表示UI改善
- [ ] トースト通知コンポーネント追加
- [ ] mutation失敗時のユーザー通知
- [ ] ネットワークエラー時のリトライUI

---

## 完了済み

### Phase 1-2: 基盤整備
- [x] `src/domain/types/error.ts` - Result型、DomainError
- [x] `src/infra/http/client.ts` - 統一HTTPクライアント
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

domain ← 全層から参照可能（逆方向禁止）
```
