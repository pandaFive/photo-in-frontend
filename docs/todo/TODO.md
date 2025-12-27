# フロントエンド改善TODO

**作成日**: 2025年12月26日
**総合レビューレポート**: `/FRONTEND_REVIEW_REPORT.md`

---

## 進捗サマリー

| 優先度 | 総数 | 完了 | 残り |
|--------|------|------|------|
| Critical | 2 | 2 | 0 |
| High | 11 | 8 | 3 |
| Medium | 16 | 15 | 1 |
| Low | 10 | 9 | 1 |
| **合計** | **39** | **34** | **5** |

---

## High（今スプリント対応）

### セキュリティ

- [ ] **SEC-002**: AWS認証情報をIAMロールに移行 ⚠️インフラ対応必要
  - ファイル: `src/app/api/aws/route.ts`
  - 問題: 環境変数にAWSシークレットキーを直接保存
  - 備考: ECS Task Role、Amplify設定等のインフラ変更が必要。フロントエンドのみでは対応不可。
  - 工数: 4h（インフラ側作業）
  - 移動元: Critical（2025-12-26）

---

## Low（バックログ）

（CODE-009〜CODE-017は対応済みセクションに移動）

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

## 備考

- Critical問題は本番デプロイ前に**必須**で解決すること
- セキュリティ関連は特に優先して対応
- テスト追加は機能修正と並行して実施可能
- 工数は目安、実装時に調整すること

---

# 対応済み

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

- [x] **SEC-009**: レート制限ミドルウェア実装 ✅完了
  - ファイル: `src/middleware.ts`（新規）
  - 問題: APIエンドポイントにレート制限なし
  - 対応: インメモリレート制限実装（100req/min一般、10req/min認証）、Retry-Afterヘッダー、クリーンアップ機構追加
  - 完了日: 2025-12-27

- [x] **SEC-010**: `.env.development`をgitignoreに追加確認 ✅完了
  - ファイル: `.gitignore`
  - 問題: 環境変数ファイルが暗号化なし
  - 対応: `.env*.development`パターンで既にgitignoreに設定済みを確認
  - 完了日: 2025-12-27

- [x] **SEC-011**: エラーログから機密情報除去 ✅完了
  - ファイル: `src/util/safe-logger.ts`（新規）、全Route Handlers、認証ユーティリティ
  - 問題: console.errorにエラー詳細を出力
  - 対応: 安全なログユーティリティ（logError/logWarn/logDebug）を作成、JWT・Bearer・AWSキー・パスワード等をサニタイズ、全Route Handlersで使用
  - 完了日: 2025-12-27

### パフォーマンス

- [x] **PERF-001**: `useTaskDetail`をSWR化 ✅完了
  - ファイル: `src/queries/useTaskDetail.ts`
  - 問題: 手動Mapキャッシュがメモリリーク、有効期限なし
  - 対応: SWRの条件付きフェッチに移行、配列キー形式で特殊文字対応、エラー状態のUI表示追加
  - テスト: `src/__tests__/queries/useTaskDetail.test.tsx`, `src/__tests__/components/TaskAccordion.test.tsx`
  - 完了日: 2025-12-27

- [x] **PERF-002**: ダッシュボードN+1クエリ解消 ✅完了
  - ファイル: `src/app/(admin)/dashboard/page.tsx`, `src/components/Orders.tsx`, `src/components/Uncompletes.tsx`
  - 問題: 3つのAPIが個別に呼び出され、バッチ化されていない
  - 対応: Server Componentで`Promise.all()`を使用し3つのAPIを並列呼び出し、子コンポーネントにprops経由で渡す
  - 効果: クライアント側の2つのuseEffect API呼び出しを削除、サーバー側で並列化
  - 完了日: 2025-12-27

- [x] **PERF-006**: Orders/UncompleteをSWR使用に変更 ✅PERF-002で解決済み
  - ファイル: `src/components/Orders.tsx`, `src/components/Uncompletes.tsx`
  - 問題: useEffectで直接fetch、重複排除なし
  - 解決: PERF-002でServer Component化。データはdashboard/page.tsxからprops経由で渡される形式に変更。
  - 判断: SWRはクライアントサイドキャッシュ用のためServer Componentには不適用。元の問題は解消済み。
  - 完了日: 2025-12-27

- [x] **PERF-003**: Route Handlersにキャッシュヘッダー追加 ✅完了
  - ファイル: 5つのRoute Handlers
  - 問題: `cache: 'no-store'`で毎回バックエンド呼び出し
  - 対応: `Cache-Control: private, max-age=10, stale-while-revalidate=30`を追加
  - 適用ファイル: `tasks/all`, `tasks/ng`, `areas`, `comments`, `account/[id]/tasks`
  - 完了日: 2025-12-27

- [x] **PERF-004**: `styled-components`依存関係削除 ✅完了
  - ファイル: `package.json`
  - 問題: 未使用だが+50KBバンドル
  - 対応: `styled-components`と`@mui/styled-engine-sc`を削除（12パッケージ削減）
  - 完了日: 2025-12-27

- [x] **PERF-005**: `MemberCard`にmemo()追加 ✅完了
  - ファイル: `src/components/MemberCard.tsx`
  - 問題: リスト再レンダー時に全カードが再レンダー
  - 対応: `memo()`でコンポーネントをラップし不要な再レンダー防止
  - 完了日: 2025-12-27

### コード品質

- [x] **CODE-005**: リクエストボディバリデーション追加 ✅完了
  - ファイル: `src/app/api/comment/route.ts`
  - 問題: JSONボディを`as Body`で型アサーションのみ
  - 対応: POST/PUTでcontent, taskId, idの必須・型・範囲チェックを追加
  - 完了日: 2025-12-27

- [x] **CODE-006**: console.log/errorの統一 ✅完了
  - ファイル: 12箇所（api/, queries/, mutations/, middleware.ts）
  - 問題: エラーログ戦略が非統一
  - 対応: 全箇所をlogError()に統一、機密情報サニタイズを適用
  - 完了日: 2025-12-27

- [x] **CODE-007**: Task型定義の厳格化 ✅完了
  - ファイル: `src/app/api/task/[id]/reassign/route.ts`
  - 問題: `[key: string]: string | number`が緩すぎる
  - 対応: `src/types/index.ts`のTask型をimportして使用
  - 完了日: 2025-12-27

- [x] **CODE-008**: `CommentApiResponse`型の厳格化 ✅完了
  - ファイル: `src/types/index.ts`
  - 問題: `[key: string]: string`が緩すぎる
  - 対応: `{ message: string }`に厳格化
  - 完了日: 2025-12-27

- [x] **CODE-013**: ダッシュボードのエラーハンドリング改善 ✅完了
  - ファイル: `src/app/(admin)/dashboard/page.tsx`, `src/api/get-account-status.ts`, `src/api/get-unfulfilled-count.ts`, `src/components/Orders.tsx`, `src/components/Uncompletes.tsx`
  - 問題: API失敗時にサイレントフォールバック（空配列/0）でユーザー通知なし
  - 対応:
    1. get-account-status.ts, get-unfulfilled-count.tsにlogError追加（get-areas.tsと統一）
    2. dashboard/page.tsxでエラー状態を追跡しログ出力
    3. Orders/Uncomletesにerror prop追加、エラー時はAlertコンポーネントで表示
  - 完了日: 2025-12-27

### アーキテクチャ

- [x] **ARCH-001**: Root Layoutプロバイダーラップ ⏸️適用外
  - ファイル: `src/app/layout.tsx`
  - 問題: Server Componentでクライアントプロバイダーを直接レンダリング
  - 判断: MUI AppRouterCacheProviderが既にServer/Client境界を適切に処理しており、追加のProviders分離は不要。Headerがasync Server Componentのため、Clientコンポーネント内に配置すると実行時エラー発生。現状の構造が最適。
  - 見送り日: 2025-12-27

- [x] **ARCH-002**: SWR_KEYSにコメント追加 ✅完了
  - ファイル: `src/util/swr/keys.ts`
  - 問題: パラメータの意図が不明確
  - 対応: 各キーにJSDocコメントを追加（用途、パラメータ説明）
  - 完了日: 2025-12-27

### コード品質（Low）

- [x] **CODE-009**: TODOコメント削除 ✅完了
  - ファイル: `src/app/login/page.tsx`
  - 問題: デモ用コードのTODOが残存
  - 対応: 不要なTODOコメントを削除
  - 完了日: 2025-12-28

- [x] **CODE-010**: AreaListCheckの空`.then()`修正 ✅完了
  - ファイル: `src/components/AreaListCheck.tsx`
  - 問題: 空のPromiseチェーン
  - 対応: `void getArea()`に簡素化
  - 完了日: 2025-12-28

- [x] **CODE-011**: CommentListのネストコールバック簡素化 ⏸️適用外
  - ファイル: `src/components/CommentList.tsx`
  - 問題: `useCallback((id) => () => {})`パターン
  - 判断: MUI DataGridのアクションハンドラーとして正しいパターン。columns useMemoの依存配列に含まれ安定した参照が必要。現状維持。
  - 見送り日: 2025-12-28

- [x] **CODE-012**: TaskListのインラインsx抽出 ✅完了
  - ファイル: `src/components/TaskList.tsx`
  - 問題: インラインsxオブジェクトが毎レンダー再作成
  - 対応: containerStyle, pageHeaderStyle, sectionHeaderStyle, sectionPaperStyle, taskCountChipStyleを定数として抽出
  - 完了日: 2025-12-28

- [x] **CODE-014**: 認証トークン欠落時のログ追加 ✅完了
  - ファイル: `src/api/get-account-status.ts`
  - 問題: トークンがない場合にlogErrorなし
  - 対応: `logError('[getAccountStatus]', 'Token not found in cookies')`追加
  - 完了日: 2025-12-28

- [x] **CODE-015**: Uncomletesエラーメッセージ改善 ✅完了
  - ファイル: `src/components/Uncompletes.tsx`
  - 問題: エラーメッセージが「取得失敗」のみで簡素すぎる
  - 対応: 「非達成件数の取得に失敗しました。再読み込みしてください。」に変更
  - 完了日: 2025-12-28

- [x] **CODE-016**: AreaChips/UploadButtonにerror prop追加 ✅完了
  - ファイル: `src/app/(admin)/dashboard/page.tsx`, `src/components/AreaChips.tsx`, `src/components/Buttons/UploadButton.tsx`
  - 問題: areas取得失敗時にエラー状態が伝播されない
  - 対応: error propを追加、エラー時はAlertでメッセージ表示、UploadButtonは無効化
  - 完了日: 2025-12-28

- [x] **CODE-017**: エラーAlertにリトライボタン追加 ✅完了
  - ファイル: `src/components/Orders.tsx`, `src/components/Uncompletes.tsx`
  - 問題: 「再読み込みしてください」と表示するがボタンがない
  - 対応: Alert actionにRefreshIconと再読み込みボタンを追加
  - 完了日: 2025-12-28

### テスト

- [x] **TEST-004**: Cookie操作テスト追加 ✅完了
  - ファイル: `src/__tests__/util/cookies.test.ts`（新規）
  - 対象: `src/util/cookies.ts`
  - 対応: getCookies, setCookies, deleteCookieの全機能テスト追加（13テスト）、SEC-003のsameSite/secure属性検証含む
  - 完了日: 2025-12-27

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
| 2025-12-27 | CODE-002 | parseErrorMessageを共通ユーティリティに抽出 | Claude |
| 2025-12-27 | CODE-003 | MutationResult型を統合 | Claude |
| 2025-12-27 | CODE-004 | ESLint overrideパターン修正 | Claude |
| 2025-12-27 | SEC-009 | レート制限ミドルウェア実装 | Claude |
| 2025-12-27 | SEC-010 | .env.developmentのgitignore確認 | Claude |
| 2025-12-27 | SEC-011 | エラーログから機密情報除去 | Claude |
| 2025-12-27 | CODE-005 | リクエストボディバリデーション追加 | Claude |
| 2025-12-27 | CODE-006 | console.log/errorの統一 | Claude |
| 2025-12-27 | CODE-007 | Task型定義の厳格化 | Claude |
| 2025-12-27 | CODE-008 | CommentApiResponse型の厳格化 | Claude |
| 2025-12-27 | PERF-001 | useTaskDetailをSWR化 | Claude |
| 2025-12-27 | TEST-004 | Cookie操作テスト追加 | Claude |
| 2025-12-27 | PERF-004 | styled-components依存関係削除 | Claude |
| 2025-12-27 | PERF-005 | MemberCardにmemo()追加 | Claude |
| 2025-12-27 | PERF-003 | Route Handlersにキャッシュヘッダー追加 | Claude |
| 2025-12-27 | PERF-002 | ダッシュボードN+1クエリ解消 | Claude |
| 2025-12-27 | PERF-006 | Orders/Uncomplete SWR移行（PERF-002で解決） | Claude |
| 2025-12-27 | CODE-013 | ダッシュボードのエラーハンドリング改善 | Claude |
| 2025-12-27 | ARCH-001 | Root Layoutプロバイダーラップ（適用外判断） | Claude |
| 2025-12-27 | ARCH-002 | SWR_KEYSにコメント追加 | Claude |
| 2025-12-28 | CODE-009 | TODOコメント削除 | Claude |
| 2025-12-28 | CODE-010 | AreaListCheckの空.then()修正 | Claude |
| 2025-12-28 | CODE-011 | CommentListのネストコールバック簡素化（適用外判断） | Claude |
| 2025-12-28 | CODE-012 | TaskListのインラインsx抽出 | Claude |
| 2025-12-28 | CODE-014 | 認証トークン欠落時のログ追加 | Claude |
| 2025-12-28 | CODE-015 | Uncomletesエラーメッセージ改善 | Claude |
| 2025-12-28 | CODE-016 | AreaChips/UploadButtonにerror prop追加 | Claude |
| 2025-12-28 | CODE-017 | エラーAlertにリトライボタン追加 | Claude |
