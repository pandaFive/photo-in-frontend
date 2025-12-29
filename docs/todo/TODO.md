# フロントエンド改善TODO

**作成日**: 2025年12月28日
**前回完了**: `/docs/done/DONE-2025-12-28.md`
**最終レビュー**: 2025年12月28日（総合レビュー実施）

---

## 進捗サマリー

| 優先度 | 総数 | 完了 | 残り |
|--------|------|------|------|
| Critical | 2 | 2 | 0 |
| High | 3 | 2 | 1 |
| Medium | 7 | 7 | 0 |
| Low | 25 | 12 | 13 |
| **合計** | **37** | **23** | **14** |

---

## Critical（即時対応必須）

### ログ・セキュリティ（総合レビュー 2025-12-28）

- [x] **LOG-C01**: console.error()をlogError()に置換 ✅完了
  - ファイル: 10箇所（AreaListCheck, CommentList, MemberCard, UploadButton, Details/*）
  - 完了日: 2025-12-28
  - 対応: 全`console.error()`を`logError()`に置換（6ファイル、10箇所）

- [x] **FILE-C01**: ファイルアップロードにバリデーション追加 ✅完了
  - ファイル: `src/mutations/useFileUpload.ts`, `src/app/api/aws/route.ts`
  - 完了日: 2025-12-28
  - 対応: MIMEタイプ検証（PDF）、サイズ上限（100MB）、マジックバイト検証（バックエンド）
  - PR: #113

---

## High（今スプリント対応）

### セキュリティ

- [ ] **SEC-002**: AWS認証情報をIAMロールに移行 ⚠️インフラ対応必要
  - ファイル: `src/app/api/aws/route.ts`
  - 問題: 環境変数にAWSシークレットキーを直接保存
  - 手順書: `/docs/todo/SEC-002-aws-iam-role-migration.md`
  - 備考: ECS Task Role、Amplify設定等のインフラ変更が必要。フロントエンドのみでは対応不可。
  - 工数: 4h（インフラ側作業）

- [x] **AUTH-H01**: フロントエンドロールチェックの警告追加 ✅完了
  - ファイル: `src/util/auth-check.ts`
  - 完了日: 2025-12-29
  - 対応: JSDocに⚠️セキュリティ警告を追加、バックエンド認可必須の旨を明記
  - PR: #114

### 型定義

- [x] **TYPE-H01**: CommentListのany型排除 ✅完了
  - ファイル: `src/components/CommentList.tsx`, `.eslintrc.json`
  - 完了日: 2025-12-29
  - 対応: CommentRow型を定義、ESLint overrideを削除
  - PR: #115

---

## Medium（次スプリント対応）

### エラーハンドリング（PR #96 Critical）

- [x] **ERR-003**: サイレントログイン失敗の修正 ✅完了
  - ファイル: `src/api/post-login.ts`, `src/util/actions/login.ts`, `src/app/page.tsx`
  - 完了日: 2025-12-28
  - 対応: `ErrorResponse`型を返し、クエリパラメータでエラーをUIに表示
  - PR: #97

- [x] **ERR-004**: サイレントサインアップ失敗の修正 ✅完了
  - ファイル: `src/api/post-signup.ts`, `src/util/actions/signUp.ts`, `src/app/(admin)/account/create/page.tsx`
  - 完了日: 2025-12-28
  - 対応: `ErrorResponse`型を返し、UIでエラー表示
  - PR: #97

### エラーハンドリング（PR #94 Important）

- [x] **ERR-001**: res.text()エラーのログ追加 ✅完了
  - ファイル: 10ファイル（areas, tasks/all, tasks/ng, comments, comment, account/[id], account/[id]/tasks, task/[id]/complete, task/[id]/ng, task/[id]/reassign）
  - 完了日: 2025-12-29
  - 対応: `.catch(() => '')`を`catch((err) => { logError(...); return ''; })`に修正（12箇所）
  - PR: #116

- [x] **ERR-002**: JSONパースエラーの分離 ✅完了
  - ファイル: 同上（10ファイル、12箇所）
  - 完了日: 2025-12-29
  - 対応: res.json()をtry-catchでラップ、パースエラー時に502「バックエンドから不正なレスポンスを受信しました」を返却
  - PR: #117

### アーキテクチャ（総合レビュー）

- [x] **DRY-M01**: Route Handler認証パターンの共通化 ✅完了
  - ファイル: `src/util/route-helpers.ts`（新規）、`src/app/api/*/route.ts`（10ファイル）
  - 完了日: 2025-12-29
  - 対応: `requireAuth()`, `requireAdmin()`, `requireValidId()`ヘルパー関数を作成し、全Route Handlerに適用
  - PR: #120

### セキュリティ（総合レビュー）

- [x] **SEC-M01**: HSTSヘッダー追加 ✅完了
  - ファイル: `next.config.mjs`
  - 完了日: 2025-12-29
  - 対応: `Strict-Transport-Security: max-age=31536000; includeSubDomains`追加
  - PR: #118

### パフォーマンス（総合レビュー）

- [x] **PERF-M01**: 大規模リストコンポーネントのmemo化 ✅完了
  - ファイル: `src/components/TaskList.tsx`, `src/components/CommentList.tsx`
  - 完了日: 2025-12-29
  - 対応: `React.memo()`でラップ（TaskList, CommentList, EditToolbar）
  - PR: #119

---

## Low（バックログ）

### セキュリティ

- [x] **SEC-012**: Content Security Policy (CSP) 設定追加 ✅完了
  - ファイル: `next.config.mjs`
  - 完了日: 2025-12-29
  - 対応: CSPヘッダーを追加（default-src, script-src, style-src, img-src, font-src, connect-src, object-src, frame-ancestors, base-uri, form-action, upgrade-insecure-requests）
  - 備考: MUIインラインスタイル、Next.jsハイドレーション、S3プリサインドURLを考慮
  - PR: #124

### 型定義改善

- [x] **TYPE-001**: MutationResult型の判別共用体化 ✅完了
  - ファイル: `src/types/index.ts`
  - 完了日: 2025-12-29
  - 対応: `{ success: true; data: T } | { success: false; error: string }`に変更
  - 修正箇所: 型定義、useTaskMutation、useAccountMutation、関連テスト
  - PR: #125

- [x] **TYPE-002**: Task型とTaskDetail型の分離 ✅完了
  - ファイル: `src/types/index.ts`, `src/domain/schemas/index.ts`, `src/util/grouping.ts`
  - 完了日: 2025-12-29
  - 問題: `render_task`は`history_id`/`assign_cycle_id`を返さない
  - 対応: `BaseTask`, `TaskListItem`, `ActiveTask`, `TaskDetail`型を新設
  - 備考: `Task`は後方互換性のため`TaskListItem`のエイリアスとして維持

- [x] **TYPE-003**: ValidationResult型の判別共用体化 ✅完了
  - ファイル: `src/mutations/useFileUpload.ts`
  - 完了日: 2025-12-29
  - 問題: `valid`と`error`が独立したプロパティで不正状態を許容
  - 対応: `{ valid: true } | { valid: false; error: string }`に変更

- [x] **TYPE-004**: UploadResult型の判別共用体化 ✅完了
  - ファイル: `src/mutations/useFileUpload.ts`
  - 完了日: 2025-12-29
  - 問題: `success`と`error`が独立したプロパティで不正状態を許容
  - 対応: `{ success: true } | { success: false; error: string }`に変更

- [x] **TYPE-005**: requireAdmin戻り値型の統一 ✅完了
  - ファイル: `src/util/route-helpers.ts`
  - 完了日: 2025-12-29
  - 問題: `requireAdmin()`が`null | NextResponse`を返し、他のヘルパー（`requireAuth`, `requireValidId`）の`{ ok: boolean }`パターンと不整合
  - 対応: `AdminResult = { ok: true } | { ok: false; response: NextResponse }` に変更

- [ ] **TYPE-006**: MutationResultでフルエラーオブジェクト保持
  - ファイル: `src/types/index.ts`, `src/mutations/*.ts`
  - 問題: `MutationResult.error`が`string`型のため、mutation層でエラー情報（type, status）が消失
  - 対応: `error: string`を`error: DomainError | string`に変更、またはerrorCode追加を検討
  - 出典: PR #130 レビュー
  - 工数: 2h

### ログ改善

- [x] **LOG-001**: 認証失敗ログ追加 ✅完了
  - ファイル: `src/util/route-helpers.ts`
  - 完了日: 2025-12-29
  - 対応: `logWarn('[requireAuth]', '認証トークンが存在しません')` 等を追加
  - PR: #121

- [x] **LOG-004**: 認可失敗ログ追加 ✅完了
  - ファイル: `src/util/route-helpers.ts`
  - 完了日: 2025-12-29
  - 対応: `logWarn('[requireAdmin]', '管理者権限が必要な操作への非管理者アクセス試行')` を追加
  - PR: #121

- [x] **LOG-005**: IDバリデーション失敗ログ追加 ✅完了
  - ファイル: `src/util/route-helpers.ts`
  - 完了日: 2025-12-29
  - 対応: `logDebug('[requireValidId]', 'IDバリデーション失敗: ...')` を追加（デバッグレベル）
  - PR: #122

- [x] **LOG-002**: エラーオブジェクト全体をログ出力 ✅完了
  - ファイル: `src/api/*.ts`（8ファイル）、`src/mutations/*.ts`（2ファイル）
  - 完了日: 2025-12-30
  - 問題: `result.error.message`のみでフルオブジェクトが消失
  - 対応: `logError(ctx, result.error)`に変更（12箇所）

- [ ] **LOG-003**: ログコンテキスト形式の統一
  - ファイル: 複数ファイル
  - 問題: `[postLogin]`と`[Middleware] レート制限`で形式が異なる
  - 対応: `[Category:function]`形式に統一
  - 工数: 1h

- [ ] **LOG-006**: get-week-complete.tsにエラーログ追加
  - ファイル: `src/api/get-week-complete.ts`
  - 問題: エラー時に`logError()`を呼ばずに`ErrorResponse`を返却
  - 対応: `logError('[getWeekComplete]', result.error)`を追加
  - 出典: PR #130 レビュー
  - 工数: 0.5h

### コード品質

- [ ] **AUTH-001**: 認証エラーの区別
  - ファイル: Route Handlers
  - 問題: `cookie_error`と`no_token`が同一扱い
  - 対応: ステータスコード分岐（500/401）
  - 工数: 1h

- [ ] **ERR-L01**: AreaListCheckの広範なcatchブロック改善（PR #112）
  - ファイル: `src/components/AreaListCheck.tsx`
  - 問題: 全例外を同一エラーメッセージで処理、エラー種別の区別なし
  - 対応: ネットワークエラー、認証エラー等を区別してユーザーに適切なメッセージ表示
  - 備考: 現状でも機能的には問題なし、UX改善として検討
  - 工数: 1h

- [x] **CODE-018**: 'use server'ディレクティブの削除 ✅完了
  - ファイル: `src/app/api/`配下の全Route Handler（11ファイル）
  - 完了日: 2025-12-29
  - 問題: Route Handlerに不要なディレクティブ（Server Actions用）
  - 対応: 各ファイルの1行目 `'use server';` を削除

- [x] **CODE-019**: validateId使用の統一 ✅完了
  - ファイル: `src/app/api/comment/route.ts`
  - 完了日: 2025-12-29
  - 対応: DELETEハンドラで`requireValidId()`ヘルパーを使用するよう変更
  - PR: #123

### ドキュメント

- [ ] **DOC-001**: API仕様書の作成
  - ファイル: `docs/api/` (新規)
  - 内容: Route Handlersのエンドポイント一覧、リクエスト/レスポンス形式
  - 工数: 2h

- [ ] **DOC-002**: コンポーネントカタログの作成
  - ファイル: `docs/components/` (新規)
  - 内容: UIコンポーネントの使用例、Props一覧
  - 備考: Storybook導入も検討可
  - 工数: 4h

### 最適化

- [ ] **OPT-001**: バンドルサイズ分析・最適化
  - 内容: `@next/bundle-analyzer`導入、未使用コードの削除
  - 備考: styled-components削除（PERF-004）で12パッケージ削減済み
  - 工数: 2h

- [ ] **OPT-002**: Lighthouse パフォーマンススコア改善
  - 内容: Core Web Vitals（LCP, FID, CLS）の計測・改善
  - 目標: パフォーマンススコア90以上
  - 工数: 4h

### ツール・インフラ

- [ ] **TOOL-001**: oxlint, oxfmt, tsgo導入
  - 内容: 高速リンター・フォーマッターへの移行検討
  - 工数: 4h

### 新機能

- [ ] **FEAT-001**: 404 Not Found ページ作成
  - ファイル: `src/app/not-found.tsx` (新規)
  - 内容: カスタム404ページの実装
  - 工数: 1h

- [ ] **FEAT-002**: タスクコメント機能実装
  - 内容: タスクへのコメント追加機能
  - 工数: 8h

---

## 備考

- **Critical（LOG-C01, FILE-C01）は即時対応必須** - セキュリティリスクあり
- SEC-002は本番デプロイ前に**必須**で解決すること（インフラチームと連携）
- Medium優先度（ERR-003, ERR-004）はユーザー体験に直結するため早期対応推奨
- Low優先度タスクは次スプリント以降で対応
- 新規タスク追加時は優先度とカテゴリを明記すること

---

## 課題の出典

| ID | 出典 | 優先度 |
|----|------|--------|
| LOG-C01, FILE-C01 | 総合レビュー 2025-12-28 | Critical |
| AUTH-H01, TYPE-H01 | 総合レビュー 2025-12-28 | High |
| DRY-M01, SEC-M01, PERF-M01 | 総合レビュー 2025-12-28 | Medium |
| ERR-001, ERR-002 | PR #94 Important | Medium |
| TYPE-001, LOG-001, AUTH-001, CODE-018 | PR #94 Suggestions | Low |
| ERR-003, ERR-004 | PR #96 Critical | Medium |
| TYPE-002, LOG-002 | PR #96 Medium | Low |
| LOG-003 | PR #96 Suggestions | Low |
| ERR-L01 | PR #112 Important | Low |
| TYPE-003, TYPE-004 | PR #113 Suggestions | Low |
| LOG-001, LOG-004 | PR #120 Important | Low |
| TYPE-005, LOG-005, CODE-019 | PR #120 Suggestions | Low |
| TYPE-006, LOG-006 | PR #130 Suggestions | Low |

---

## 完了履歴

| 日付 | ID | タスク | 担当 |
|------|-----|--------|------|
| 2025-12-28 | LOG-C01 | console.error()をlogError()に置換 | Claude |
| 2025-12-28 | - | AreaListCheckサイレント失敗修正（PR #112 Critical） | Claude |
| 2025-12-28 | - | CommentList楽観的UIロールバック追加（PR #112 Important） | Claude |
| 2025-12-28 | FILE-C01 | ファイルアップロードバリデーション追加（PR #113） | Claude |
| 2025-12-28 | ERR-003 | サイレントログイン失敗修正（PR #97） | Claude |
| 2025-12-28 | ERR-004 | サイレントサインアップ失敗修正（PR #97） | Claude |
| 2025-12-29 | AUTH-H01 | フロントエンドロールチェック警告追加（PR #114） | Claude |
| 2025-12-29 | TYPE-H01 | CommentListのany型排除（PR #115） | Claude |
| 2025-12-29 | ERR-001 | res.text()エラーのログ追加（PR #116） | Claude |
| 2025-12-29 | ERR-002 | JSONパースエラー分離（PR #117） | Claude |
| 2025-12-29 | SEC-M01 | HSTSヘッダー追加（PR #118） | Claude |
| 2025-12-29 | PERF-M01 | 大規模リストコンポーネントのmemo化（PR #119） | Claude |
| 2025-12-29 | DRY-M01 | Route Handler認証パターン共通化（PR #120） | Claude |
| 2025-12-29 | LOG-001, LOG-004 | 認証・認可失敗ログ追加（PR #121） | Claude |
| 2025-12-30 | LOG-002 | エラーオブジェクト全体をログ出力 | Claude |

---

## 過去の完了タスク

2025-12-26〜2025-12-28に完了した37タスクは `/docs/done/DONE-2025-12-28.md` を参照。
