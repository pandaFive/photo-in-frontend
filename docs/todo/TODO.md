# フロントエンド改善TODO

**作成日**: 2025年12月26日
**総合レビューレポート**: `/FRONTEND_REVIEW_REPORT.md`

---

## 進捗サマリー

| 優先度 | 総数 | 完了 | 残り |
|--------|------|------|------|
| Critical | 2 | 2 | 0 |
| High | 11 | 8 | 3 |
| Medium | 15 | 0 | 15 |
| Low | 6 | 0 | 6 |
| **合計** | **34** | **10** | **24** |

---

## Critical（即時対応必須）

### セキュリティ

- [x] **SEC-001**: AWS S3ルートに認証チェック追加 ✅完了
  - ファイル: `src/app/api/aws/route.ts`
  - 問題: GET/POSTで認証なしにS3アクセス可能
  - 対応: `getAuthHeaders()`による認証チェック追加、テスト追加
  - 完了日: 2025-12-26

### コード品質

- [x] **CODE-001**: HTTPクライアントの型アサーションにバリデーション追加 ✅完了
  - ファイル: `src/infra/http/client.ts`, `src/infra/http/serverClient.ts`
  - 問題: `as T`型アサーションがランタイムバリデーションなし
  - 対応: zodライブラリ導入、`schema`オプション追加、バリデーションユーティリティ作成
  - 新規ファイル: `src/infra/validation/index.ts`, `src/domain/schemas/index.ts`
  - 完了日: 2025-12-26

---

## High（今スプリント対応）

### セキュリティ

- [x] **SEC-003**: Cookie設定に`sameSite: 'strict'`追加 ✅完了
  - ファイル: `src/util/cookies.ts`
  - 問題: CSRF対策のsameSite属性なし
  - 対応: `sameSite: 'strict'`と`secure`属性を追加
  - 完了日: 2025-12-26

- [x] **SEC-004**: セキュリティヘッダー追加 ✅完了
  - ファイル: `next.config.mjs`
  - 問題: CSP, X-Frame-Options等のヘッダー未設定
  - 対応: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, Permissions-Policy追加
  - 備考: CSPは外部リソース調査が必要なため別タスクに切り出し
  - 完了日: 2025-12-26

- [x] **SEC-005**: CSRFトークン保護実装 ⏸️見送り
  - ファイル: 全Route Handlers
  - 問題: 状態変更操作にCSRFトークンなし
  - 判断: Next.js App Router + JWT認証構成ではCSRFリスクが低い。SEC-003（sameSite: strict）で実質的なCSRF防御を実現。実装コストに対してセキュリティ向上効果が限定的なため見送り。
  - 見送り日: 2025-12-26

- [x] **SEC-006**: Route Handlersに認可チェック追加 ✅完了
  - ファイル: `src/app/api/account/[id]/route.ts`
  - 新規ファイル: `src/util/auth-check.ts`
  - 問題: トークン有無のみ確認、ユーザー権限未検証
  - 対応: `isAuthenticated()`、`isAdminFromCookie()`関数を作成、ログイン時にrole Cookieを保存、アカウント削除に認可チェック追加
  - 完了日: 2025-12-26

- [x] **SEC-007**: クエリパラメータのバウンドチェック追加 ✅完了
  - ファイル: 全Route Handlers（7ファイル）
  - 新規ファイル: `src/util/validation.ts`
  - 問題: IDの範囲検証なし
  - 対応: `validateId()`関数を作成、正の整数・MAX_SAFE_INTEGER以下を検証、全Route Handlerに適用
  - 完了日: 2025-12-26

- [x] **SEC-008**: ファイル名サニタイズ追加 ✅完了
  - ファイル: `src/app/api/aws/route.ts`
  - 新規ファイル: `src/util/s3-security.ts`
  - 問題: ユーザー入力のファイル名がS3キーに直接使用
  - 対応: `sanitizeFileName()`と`isValidS3Key()`を実装、パストラバーサル攻撃を防止
  - 完了日: 2025-12-26

### コード品質

- [x] **CODE-002**: `parseErrorMessage`を共通ユーティリティに抽出 ✅完了
  - ファイル: `src/infra/http/client.ts`, `src/infra/http/serverClient.ts` → `src/util/parse-error.ts`
  - 問題: 同一関数が2箇所に重複実装
  - 対応: `src/util/parse-error.ts`に共通関数を作成、両クライアントからimport
  - 完了日: 2025-12-27

- [x] **CODE-003**: `MutationResult`型を統合 ✅完了
  - ファイル: `src/mutations/useTaskMutation.ts`, `useAccountMutation.ts`, `useCommentMutation.ts` → `src/types/index.ts`
  - 問題: 同一型が3箇所に定義（DRY違反）
  - 対応: `MutationResult<T = void>`をtypes/index.tsに定義、各mutationファイルからimport
  - 完了日: 2025-12-27

- [x] **CODE-004**: ESLint overrideパターン修正 ✅完了
  - ファイル: `.eslintrc.json`
  - 問題: `@/components/CommentList.tsx`が実際のパスと不一致
  - 対応: `src/components/CommentList.tsx`に修正（ESLintはファイルパス、エイリアス不可）
  - 完了日: 2025-12-27

---

## Medium（次スプリント対応）

### セキュリティ

- [ ] **SEC-002**: AWS認証情報をIAMロールに移行 ⚠️インフラ対応必要
  - ファイル: `src/app/api/aws/route.ts`
  - 問題: 環境変数にAWSシークレットキーを直接保存
  - 備考: ECS Task Role、Amplify設定等のインフラ変更が必要。フロントエンドのみでは対応不可。
  - 工数: 4h（インフラ側作業）
  - 移動元: Critical（2025-12-26）

- [ ] **SEC-009**: レート制限ミドルウェア実装
  - ファイル: `middleware.ts`（新規）
  - 問題: APIエンドポイントにレート制限なし
  - 工数: 4h

- [ ] **SEC-010**: `.env.development`をgitignoreに追加確認
  - ファイル: `.gitignore`, `.env.development`
  - 問題: 環境変数ファイルが暗号化なし
  - 工数: 30m

- [ ] **SEC-011**: エラーログから機密情報除去
  - ファイル: 複数Route Handlers, API関数
  - 問題: console.errorにエラー詳細を出力
  - 工数: 2h

### パフォーマンス

- [ ] **PERF-001**: `useTaskDetail`をSWR化
  - ファイル: `src/queries/useTaskDetail.ts`
  - 問題: 手動Mapキャッシュがメモリリーク、有効期限なし
  - 工数: 4h

- [ ] **PERF-002**: ダッシュボードN+1クエリ解消
  - ファイル: `src/components/Orders.tsx`, `src/components/Uncompletes.tsx`
  - 問題: 3つのAPIが個別に呼び出され、バッチ化されていない
  - 工数: 3h

- [ ] **PERF-003**: Route Handlersにキャッシュヘッダー追加
  - ファイル: `src/app/api/tasks/all/route.ts`
  - 問題: `cache: 'no-store'`で毎回バックエンド呼び出し
  - 工数: 1h

- [ ] **PERF-004**: `styled-components`依存関係削除
  - ファイル: `package.json`
  - 問題: 未使用だが+50KBバンドル
  - 工数: 30m

- [ ] **PERF-005**: `MemberCard`にmemo()追加
  - ファイル: `src/components/MemberCard.tsx`
  - 問題: リスト再レンダー時に全カードが再レンダー
  - 工数: 30m

- [ ] **PERF-006**: Orders/UncompleteをSWR使用に変更
  - ファイル: `src/components/Orders.tsx`, `src/components/Uncompletes.tsx`
  - 問題: useEffectで直接fetch、重複排除なし
  - 工数: 2h

### コード品質

- [ ] **CODE-005**: リクエストボディバリデーション追加
  - ファイル: `src/app/api/comment/route.ts`
  - 問題: JSONボディを`as Body`で型アサーションのみ
  - 工数: 1h

- [ ] **CODE-006**: console.log/errorの統一
  - ファイル: 12箇所（複数ファイル）
  - 問題: エラーログ戦略が非統一
  - 工数: 2h

- [ ] **CODE-007**: Task型定義の厳格化
  - ファイル: `src/app/api/task/[id]/reassign/route.ts`
  - 問題: `[key: string]: string | number`が緩すぎる
  - 工数: 30m

- [ ] **CODE-008**: `CommentApiResponse`型の厳格化
  - ファイル: `src/types/index.ts`
  - 問題: `[key: string]: string`が緩すぎる
  - 工数: 30m

---

## Low（バックログ）

### コード品質

- [ ] **CODE-009**: TODOコメント削除
  - ファイル: `src/app/login/page.tsx`（行20）
  - 問題: デモ用コードのTODOが残存
  - 工数: 10m

- [ ] **CODE-010**: AreaListCheckの空`.then()`修正
  - ファイル: `src/components/AreaListCheck.tsx`
  - 問題: 空のPromiseチェーン
  - 工数: 15m

- [ ] **CODE-011**: CommentListのネストコールバック簡素化
  - ファイル: `src/components/CommentList.tsx`
  - 問題: `useCallback((id) => () => {})`パターン
  - 工数: 30m

- [ ] **CODE-012**: TaskListのインラインsx抽出
  - ファイル: `src/components/TaskList.tsx`
  - 問題: インラインsxオブジェクトが毎レンダー再作成
  - 工数: 30m

### アーキテクチャ

- [ ] **ARCH-001**: Root Layoutプロバイダーラップ
  - ファイル: `src/app/layout.tsx`
  - 問題: Server ComponentでクライアントプロバイダーをレンダリングThemeProvider>
  - 工数: 1h

- [ ] **ARCH-002**: SWR_KEYSにコメント追加
  - ファイル: `src/util/swr/keys.ts`
  - 問題: パラメータの意図が不明確
  - 工数: 15m

---

## テストカバレッジ追加

### Critical（認証フロー）

- [ ] **TEST-001**: Server Actionsテスト追加
  - ファイル: `src/__tests__/util/actions/login.test.ts`（新規）
  - 対象: `src/util/actions/login.ts`
  - 工数: 3h

- [ ] **TEST-002**: Server Actionsテスト追加
  - ファイル: `src/__tests__/util/actions/logout.test.ts`（新規）
  - 対象: `src/util/actions/logout.ts`
  - 工数: 2h

- [ ] **TEST-003**: Server Actionsテスト追加
  - ファイル: `src/__tests__/util/actions/signUp.test.ts`（新規）
  - 対象: `src/util/actions/signUp.ts`
  - 工数: 2h

- [ ] **TEST-004**: Cookie操作テスト追加
  - ファイル: `src/__tests__/util/cookies.test.ts`（新規）
  - 対象: `src/util/cookies.ts`
  - 工数: 2h

- [ ] **TEST-005**: グルーピング関数テスト追加
  - ファイル: `src/__tests__/util/grouping.test.ts`（新規）
  - 対象: `src/util/grouping.ts`
  - 工数: 2h

### High（API関数）

- [ ] **TEST-006**: API関数テスト追加
  - ファイル: `src/__tests__/api/post-login.test.ts`（新規）
  - 対象: `src/api/post-login.ts`
  - 工数: 2h

- [ ] **TEST-007**: API関数テスト追加
  - ファイル: `src/__tests__/api/post-signup.test.ts`（新規）
  - 対象: `src/api/post-signup.ts`
  - 工数: 2h

- [ ] **TEST-008**: API関数テスト追加
  - ファイル: `src/__tests__/api/get-account.test.ts`（新規）
  - 対象: `src/api/get-account.ts`
  - 工数: 1h

- [ ] **TEST-009**: フェッチャーテスト追加
  - ファイル: `src/__tests__/api/tasks/fetchers.test.ts`（新規）
  - 対象: `src/api/tasks/fetchers.ts`
  - 工数: 2h

### Medium（コンポーネント）

- [ ] **TEST-010**: コンポーネントテスト追加
  - ファイル: `src/__tests__/components/AppBar.test.tsx`（新規）
  - 対象: `src/components/AppBar.tsx`
  - 工数: 3h

- [ ] **TEST-011**: コンポーネントテスト追加
  - ファイル: `src/__tests__/components/Orders.test.tsx`（新規）
  - 対象: `src/components/Orders.tsx`
  - 工数: 2h

- [ ] **TEST-012**: コンポーネントテスト追加
  - ファイル: `src/__tests__/components/UploadButton.test.tsx`（新規）
  - 対象: `src/components/Buttons/UploadButton.tsx`
  - 工数: 2h

- [ ] **TEST-013**: コンポーネントテスト追加
  - ファイル: `src/__tests__/components/Drawer.test.tsx`（新規）
  - 対象: `src/components/Drawer.tsx`
  - 工数: 2h

- [ ] **TEST-014**: コンポーネントテスト追加
  - ファイル: `src/__tests__/components/AreaChips.test.tsx`（新規）
  - 対象: `src/components/AreaChips.tsx`
  - 工数: 1h

- [ ] **TEST-015**: コンポーネントテスト追加
  - ファイル: `src/__tests__/components/Uncompletes.test.tsx`（新規）
  - 対象: `src/components/Uncompletes.tsx`
  - 工数: 2h

---

## 完了履歴

| 日付 | ID | タスク | 担当 |
|------|-----|--------|------|
| 2025-12-26 | SEC-001 | AWS S3ルートに認証チェック追加 | Claude |
| 2025-12-26 | CODE-001 | HTTPクライアントにzodバリデーション追加 | Claude |
| 2025-12-26 | SEC-008 | ファイル名サニタイズ追加 | Claude |
| 2025-12-26 | SEC-003 | Cookie設定にsameSite, secure追加 | Claude |
| 2025-12-26 | SEC-004 | セキュリティヘッダー追加 | Claude |
| 2025-12-26 | SEC-005 | CSRFトークン保護（見送り判断） | Claude |
| 2025-12-26 | SEC-006 | Route Handlersに認可チェック追加 | Claude |
| 2025-12-26 | SEC-007 | クエリパラメータのバウンドチェック追加 | Claude |

---

## 備考

- Critical問題は本番デプロイ前に**必須**で解決すること
- セキュリティ関連は特に優先して対応
- テスト追加は機能修正と並行して実施可能
- 工数は目安、実装時に調整すること
