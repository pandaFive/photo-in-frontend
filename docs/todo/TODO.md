# フロントエンド改善TODO

**作成日**: 2025年12月28日
**前回完了**: `/docs/done/DONE-2025-12-28.md`

---

## 進捗サマリー

| 優先度 | 総数 | 完了 | 残り |
|--------|------|------|------|
| High | 1 | 0 | 1 |
| Medium | 4 | 0 | 4 |
| Low | 16 | 0 | 16 |
| **合計** | **21** | **0** | **21** |

---

## High（インフラ対応必要）

### セキュリティ

- [ ] **SEC-002**: AWS認証情報をIAMロールに移行 ⚠️インフラ対応必要
  - ファイル: `src/app/api/aws/route.ts`
  - 問題: 環境変数にAWSシークレットキーを直接保存
  - 手順書: `/docs/todo/SEC-002-aws-iam-role-migration.md`
  - 備考: ECS Task Role、Amplify設定等のインフラ変更が必要。フロントエンドのみでは対応不可。
  - 工数: 4h（インフラ側作業）
  - 移動元: Critical（2025-12-26）

---

## Medium（次スプリント対応）

### エラーハンドリング（PR #96 Critical）

- [ ] **ERR-003**: サイレントログイン失敗の修正
  - ファイル: `src/api/post-login.ts`, `src/util/actions/login.ts`
  - 問題: エラー時に空オブジェクト`{}`を返し、UIにエラー表示されない
  - 対応: `ErrorResponse`型を返し、UIでエラー表示
  - 工数: 1h

- [ ] **ERR-004**: サイレントサインアップ失敗の修正
  - ファイル: `src/api/post-signup.ts`, `src/util/actions/signUp.ts`
  - 問題: エラー時に何も起きない
  - 対応: `ErrorResponse`型を返し、UIでエラー表示
  - 工数: 1h

### エラーハンドリング（PR #94 Important）

- [ ] **ERR-001**: res.text()エラーのログ追加
  - ファイル: `src/app/api/{areas,tasks/all,tasks/ng}/route.ts`
  - 問題: `.catch(() => '')` でエラー詳細が消失
  - 対応: `catch((err) => { console.error(...); return ''; })`
  - 工数: 0.5h

- [ ] **ERR-002**: JSONパースエラーの分離
  - ファイル: 同上
  - 問題: `res.json()` 失敗時に汎用エラーになる
  - 対応: 個別try-catchで502エラーを返す
  - 工数: 1h

---

## Low（バックログ）

### セキュリティ

- [ ] **SEC-012**: Content Security Policy (CSP) 設定追加
  - ファイル: `next.config.mjs`
  - 問題: CSPヘッダーが未設定
  - 備考: SEC-004で他のセキュリティヘッダーは追加済み。CSPは外部リソース（MUI CDN、Google Fonts等）の調査が必要。
  - 工数: 2h

### 型定義改善

- [ ] **TYPE-001**: MutationResult型の判別共用体化
  - ファイル: `src/types/index.ts`
  - 問題: 不正な状態を許容する型設計（`success: true`かつ`error`が存在可能）
  - 対応: `{ success: true; data: T } | { success: false; error: string }`に変更
  - 工数: 2h（全使用箇所の修正含む）

- [ ] **TYPE-002**: Task型とTaskDetail型の分離
  - ファイル: `src/types/index.ts`
  - 問題: `render_task`は`history_id`/`assign_cycle_id`を返さない
  - 対応: `TaskListItem`と`TaskDetail`型を新設
  - 工数: 2h

### ログ改善

- [ ] **LOG-001**: 認証失敗ログ追加
  - ファイル: Route Handlers
  - 問題: 認証失敗時のログがない
  - 対応: `console.warn` でreason記録
  - 工数: 1h

- [ ] **LOG-002**: エラーオブジェクト全体をログ出力
  - ファイル: 複数ファイル
  - 問題: `result.error.message`のみでフルオブジェクトが消失
  - 対応: `logError(ctx, result.error)`に変更
  - 工数: 1h

- [ ] **LOG-003**: ログコンテキスト形式の統一
  - ファイル: 複数ファイル
  - 問題: `[postLogin]`と`[Middleware] レート制限`で形式が異なる
  - 対応: `[Category:function]`形式に統一
  - 工数: 1h

### コード品質

- [ ] **AUTH-001**: 認証エラーの区別
  - ファイル: Route Handlers
  - 問題: `cookie_error`と`no_token`が同一扱い
  - 対応: ステータスコード分岐（500/401）
  - 工数: 1h

- [ ] **CODE-018**: 'use server'ディレクティブの削除
  - ファイル: `src/app/api/{areas,tasks/all,tasks/ng}/route.ts`
  - 問題: Route Handlerに不要なディレクティブ（Server Actions用）
  - 対応: 各ファイルの1行目 `'use server';` を削除
  - 工数: 0.5h

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

- SEC-002は本番デプロイ前に**必須**で解決すること（インフラチームと連携）
- Medium優先度（ERR-003, ERR-004）はユーザー体験に直結するため早期対応推奨
- Low優先度タスクは次スプリント以降で対応
- 新規タスク追加時は優先度とカテゴリを明記すること

---

## PRレビュー指摘事項の出典

| ID | 出典 | 優先度 |
|----|------|--------|
| ERR-001, ERR-002 | PR #94 Important | Medium |
| TYPE-001, LOG-001, AUTH-001, CODE-018 | PR #94 Suggestions | Low |
| ERR-003, ERR-004 | PR #96 Critical | Medium |
| TYPE-002, LOG-002 | PR #96 Medium | Low |
| LOG-003 | PR #96 Suggestions | Low |

---

## 完了履歴

| 日付 | ID | タスク | 担当 |
|------|-----|--------|------|
| - | - | - | - |

---

## 過去の完了タスク

2025-12-26〜2025-12-28に完了した37タスクは `/docs/done/DONE-2025-12-28.md` を参照。
