# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` — Next.js App Router pages and route handlers; `(admin)/(member)` contain role-specific screens, `api/` holds server routes.
- `src/components/` — Reusable UI (MUI-based) and feature components such as `TaskList`, `CommentList`, `TaskAccordion`.
- `src/api/` — Server Actions for backend calls (e.g., `get-week-complete`, `get-account-status`).
- `src/util/` — Client utilities and actions (fetch wrappers, formatters).
- `src/types/` — Shared TypeScript types and API result shapes.
- `src/__tests__/` — Jest + React Testing Library specs.
- `public/` — Static assets; `.env.local` for secrets (not committed).

## Build, Test, and Development Commands
- `npm run dev` — Start Next.js dev server on port 3333 (see `package.json` and devcontainer).
- `npm run build` / `npm start` — Production build and start.
- `npm run lint` — ESLint (Next.js config) with TypeScript rules.
- `npm test` / `npm run test:watch` — Jest suite; jsdom environment.
- `npm run lint -- --no-cache` — Useful when cache permissions are stale in devcontainers.

## Coding Style & Naming Conventions
- TypeScript strict mode; prefer explicit types for API boundaries and unknown → narrowed types.
- Imports: absolute via `@/` per `tsconfig.json`; keep group spacing consistent (eslint-plugin-import/order).
- Components and files: PascalCase for React components, camelCase for functions/variables.
- Formatting: Prettier (3.x) aligns with ESLint; run `npm run lint` before commits.

## Testing Guidelines
- Frameworks: Jest + React Testing Library; jsdom environment (`jest.setup.js` mocks ResizeObserver, MUI X).
- Location: mirror source under `src/__tests__/**` (e.g., `components/TaskList.test.tsx`).
- Write tests that mock Server Actions/fetch; avoid real network.
- Run `npm test` locally; aim to keep suites deterministic and free of act warnings.

## Commit & Pull Request Guidelines
- Commit messages: concise Japanese summaries plus reason/impact/test in body (see recent history).
- Scope small, descriptive commits; avoid committing `.env*` or generated artifacts.
- PRs: include what/why, linked issue/タスク, screenshots for UI, and test commands/results.
- Ensure `npm run lint` and `npm test` pass before requesting review; document any residual risk.

## Security & Configuration Tips
- Secrets live in `.env.local`; never commit. Required keys: `REGION`, `ACCESS_KEY`, `SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `API_HOST`, `NEXT_PUBLIC_API_HOST`.
- Upload routes accept only PDF; S3 uploads use presigned URLs—do not expose buckets publicly.
- When cache permissions break in containers, remove `.next/cache` or run lint with `--no-cache`.

## Review guidelines（Danger rank: Critical / High / Medium / Low）

> **Danger rank の目安**
>
> * **Critical**：マージすると事故る（情報漏洩・権限逸脱・データ破壊・本番停止級）
> * **High**：品質劣化が濃厚（バグ混入・将来の改修困難・重大な不整合）
> * **Medium**：保守性・一貫性が落ちる（負債化・読みづらさ・拡張性低下）
> * **Low**：軽微（表現/好み/微小な最適化）

---

### 1. 変更の意図とスコープ

**[High] PR説明が不足（Why/How/影響/確認手順なし）**

* 違反例：`fix bug` だけ、動作確認手順なし
* 遵守例：Why/How/影響範囲/確認手順（手動 + Jest）を明記

**[Medium] 1PRに無関係な変更が混在**

* 違反例：UI修正とAPI仕様変更とリファクタが同一PR
* 遵守例：目的ごとにPR分割（またはコミット単位で分離）

---

### 2. TypeScript / NestJS（Backend）

**[Critical] 認可・権限制御が抜けている / 破られる**

* 違反例：管理者APIにガード無し、ユーザーIDを入力で指定して他人のデータ取得
* 遵守例：Guard/Policyでアクセス制御、IDはセッション主体から導出し入力を信用しない

**[Critical] 秘密情報/PII をログ・例外・レスポンスに含める**

* 違反例：Authorization 헤ッダ、token、cookie、メール/住所等を `logger.info` に出す
* 遵守例：マスク/削除してログ、例外メッセージは安全な情報のみ

**[High] Controllerに業務ロジックやDB操作が混入**

* 違反例：Controllerで複雑な条件分岐、Repository直叩き
* 遵守例：Controller=I/O、Service=業務、Repository/Provider=外部I/O

**[High] DTO/Validation不備（入力をそのまま信用）**

* 違反例：`req.body` 直参照、型だけ付けて検証なし
* 遵守例：DTO + `class-validator`、不正入力は早期に `BadRequestException`

**[High] 型安全の破壊（any/過剰な型アサーション）**

* 違反例：`any` で握り潰し、`as unknown as X` の連打
* 遵守例：型を正す、やむを得ない型アサーションは局所化し理由をコメント

**[Medium] 例外の扱いが雑（握り潰し/原因不明化）**

* 違反例：`catch { return null }`、`throw new Error("failed")` だけ
* 遵守例：意味ある例外型、原因はログ/エラーコードで追える形に

**[Medium] Module依存が複雑/循環依存**

* 違反例：循環import、暗黙のprovider依存
* 遵守例：依存方向を整理、境界（domain/infra）を明確化

---

### 3. React + MUI（Frontend）

**[Critical] XSS/危険なHTML挿入（ユーザー入力のHTMLを表示）**

* 違反例：`dangerouslySetInnerHTML` にユーザー入力をそのまま入れる
* 遵守例：原則禁止。必要ならサニタイズ済み・信頼できるソース限定

**[High] データ取得・状態管理・描画が密結合**

* 違反例：コンポーネント内でAPI呼び出し/変換/描画が全部混在
* 遵守例：Container（取得・状態）と Presentational（描画）分離

**[High] 権限に関わるUI制御をフロントだけに依存**

* 違反例：UIでボタン非表示にしただけでAPIは叩ける
* 遵守例：バックエンド認可が主、フロントは補助（表示制御はOKだが防御ではない）

**[Medium] MUIスタイルの直書き乱立（theme不一致）**

* 違反例：色/余白を数値直書き、`sx` に大量ベタ書き
* 遵守例：themeの palette/spacing/typography、共通化できるものはコンポーネント化

**[Medium] アクセシビリティ不足**

* 違反例：`IconButton` にラベル無し、`TextField` がplaceholderのみ
* 遵守例：`aria-label`/`label`、エラー表示・フォーカス導線が明確

**[Low] 表記ゆれ/命名の軽微な不一致**

* 違反例：同じ概念で `userId` と `userid` が混在
* 遵守例：既存の命名規則に合わせて統一

---

### 4. ESLint / Code style

**[High] Lint違反が残ったまま（CI落ちる）**

* 違反例：警告/エラー放置、formatter未実行
* 遵守例：CIが通る状態でPR、修正困難なら理由と方針を説明

**[Medium] `eslint-disable` の乱用**

* 違反例：理由なし `eslint-disable`、広範囲に無効化
* 遵守例：最小範囲 + 理由コメント + 将来の撤去条件

**[Low] 既存のスタイルに合わせない微差**

* 違反例：同一フォルダ内でimport順がバラバラ
* 遵守例：既存の慣習に寄せる

---

### 5. Jest（テスト）

**[High] 機能追加/仕様変更なのにテストが無い**

* 違反例：ロジック変更したがテスト更新なし
* 遵守例：正常系 + 代表的な異常系、バグ修正は回帰テスト必須

**[High] 外部I/Oの扱いが不適切（テストが不安定）**

* 違反例：HTTP/DBに実アクセス、テストが環境依存
* 遵守例：外部I/Oはmock、型を保ったスタブを使用

**[Medium] 実装詳細に依存したテスト**

* 違反例：内部stateやprivate関数を直接検証
* 遵守例：ユーザー視点（表示/操作/結果）、Serviceは入出力で検証

**[Low] テスト名・構造の読みづらさ**

* 違反例：`should work` だらけ
* 遵守例：仕様が読める命名（Given/When/Then でも可）

---

### 6. セキュリティ（横断）

**[Critical] 秘密情報のコミット（env、鍵、トークン）**

* 違反例：`.env`、APIキー、JWT、Cookie値をコミット
* 遵守例：環境変数/Secrets管理、テストはダミー値

**[High] 入力検証不足による不正データ混入**

* 違反例：数値のはずが文字列でも通る、空文字許容で壊れる
* 遵守例：DTO validation、境界で弾く

**[High] 監査性の欠如（誰が何をしたか追えない）**

* 違反例：重要操作のログが皆無、エラーが追跡不能
* 遵守例：安全な監査ログ（PIIなし）と追跡可能なエラー設計

---

### 7. レビューコメント運用（must/should/nit）

**[High] must が未解消のままマージ**

* 違反例：`must` 指摘を「後で直す」で放置
* 遵守例：must解消 or 明確な代替（別PRリンク・期限）を合意してからマージ

**[Medium] 抽象・感情的な指摘**

* 違反例：「微妙」「よくない」だけ
* 遵守例：なぜリスクか + 代替案 + 影響範囲

---

