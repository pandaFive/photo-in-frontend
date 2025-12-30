# コンポーネントカタログ

**作成日**: 2025-12-30
**最終更新**: 2025-12-30
**総コンポーネント数**: 27

---

## 概要

Photo-in Frontendで使用されるUIコンポーネントの仕様書です。
すべてのコンポーネントはMaterial-UI (MUI) v5をベースに構築されています。

### デザイン規約

| 項目 | 値 |
|------|-----|
| プライマリカラー | `#667eea` |
| プライマリホバー | `#5a6fd6` |
| 背景（ページ） | `#f5f7fa` |
| 背景（カード） | `white` |
| borderRadius（カード） | `3` (24px) |
| borderRadius（ボタン） | `2` (16px) |

---

## コンポーネント一覧

| カテゴリ | コンポーネント数 |
|---------|----------------|
| [レイアウト](#レイアウト) | 5 |
| [データ表示](#データ表示) | 8 |
| [ボタン](#ボタン) | 3 |
| [ダイアログ](#ダイアログ) | 2 |
| [フォーム](#フォーム) | 3 |
| [タスク詳細](#タスク詳細) | 2 |
| [ユーティリティ](#ユーティリティ) | 5 |

---

## レイアウト

### AppBar

アプリケーションヘッダーバー。ユーザー情報とログアウト機能を提供。

**ファイル**: `src/components/AppBar.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| toggleDrawer | `() => void` | Yes | Drawer開閉のトグル関数 |
| open | `boolean` | Yes | Drawerの開閉状態 |
| name | `string` | Yes | ユーザー名（イニシャル表示用） |
| role | `string` | Yes | ユーザーロール（`admin` / `member`） |

**特徴**
- 管理者のみメニューアイコン表示
- ログアウト確認ダイアログ内蔵
- アバターにイニシャル表示

---

### Drawer

サイドナビゲーションドロワー（管理者専用）。

**ファイル**: `src/components/Drawer.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| toggleDrawer | `() => void` | Yes | Drawer開閉のトグル関数 |
| open | `boolean` | Yes | Drawerの開閉状態 |

**特徴**
- 開閉アニメーション付き
- 閉じた状態でもアイコン表示（ツールチップ付き）

---

### Footer

アプリケーションフッター。

**ファイル**: `src/components/Footer.tsx`

**Props**: なし

---

### Header

サーバーコンポーネント。アカウント情報を取得してHeaderContainerをレンダリング。

**ファイル**: `src/components/Header.tsx`

**Props**: なし（Server Component）

---

### HeaderContainer

クライアントコンポーネント。AppBarとDrawerをラップ。

**ファイル**: `src/components/HeaderContainer.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| name | `string` | Yes | ユーザー名 |
| role | `string` | Yes | ユーザーロール |
| accountId | `number` | Yes | アカウントID |

**特徴**
- ルートパスからロールに応じたリダイレクト
- 管理者のみDrawer表示

---

## データ表示

### Chart

週間完了数の折れ線グラフ。

**ファイル**: `src/components/Chart.tsx`

**Props**: なし（useWeekCompleteフックでデータ取得）

**特徴**
- MUI X Chartsを使用
- エラー時はエラーメッセージ表示
- ローディング時はデフォルト最大値で表示

---

### CircleRate

ゲージ形式のレート表示。

**ファイル**: `src/components/CircleRate.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| name | `string` | Yes | ラベル名 |
| rate | `number` | Yes | 表示するレート値（0-100） |
| size | `number` | Yes | ゲージのサイズ（px） |

---

### CommentList

コメント一覧のDataGrid。CRUD操作対応。

**ファイル**: `src/components/CommentList.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| account | `AccountData` | Yes | 現在のユーザー情報 |
| comments | `Comment[]` | Yes | コメント配列 |
| cycleId | `number` | Yes | アサインサイクルID |

**特徴**
- インライン編集対応
- 新規追加・更新・削除機能
- 楽観的UI更新（削除時ロールバック対応）
- `React.memo()`でメモ化

---

### MemberCard

メンバー情報カード。

**ファイル**: `src/components/MemberCard.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| member | `MemberStatus` | Yes | メンバーステータス情報 |
| handleDelete | `(id: number) => void` | Yes | 削除ハンドラー |

**特徴**
- NG率に応じた色分け（success/warning/error）
- 統計情報のグリッド表示
- ホバーアニメーション
- `memo()`でメモ化

---

### Orders

メンバー統計テーブル。

**ファイル**: `src/components/Orders.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| members | `MemberStatus[]` | Yes | メンバー配列 |
| error | `boolean` | No | エラー状態（default: false） |

---

### TaskList

タスク一覧表示。ソート・フィルタリング対応。

**ファイル**: `src/components/TaskList.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| id | `number` | Yes | アカウントID |
| account | `AccountData` | Yes | アカウント情報 |

**特徴**
- 日付順/地域順ソート
- すべて/NGフィルタリング（管理者のみ）
- セクション別グルーピング
- `memo()`でメモ化

---

### TaskAccordion

展開可能なタスク詳細アコーディオン。

**ファイル**: `src/components/TaskAccordion.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| account | `AccountData` | Yes | アカウント情報 |
| task | `Task` | Yes | タスク情報 |
| index | `number` | Yes | 表示インデックス |
| type | `string` | Yes | ユーザータイプ |
| dataType | `string` | Yes | データタイプ（active/NG） |
| reload | `(newDataType: string) => void` | Yes | リロード関数 |
| mutate | `KeyedMutator<Task[]>` | Yes | SWR mutate関数 |
| taskId | `number` | Yes | タスクID |

**特徴**
- 条件付きデータフェッチ（展開時のみ）
- ロールに応じた詳細コンポーネント切り替え
- `memo()`でメモ化

---

### Uncompletes

非達成件数表示。

**ファイル**: `src/components/Uncompletes.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| count | `number` | Yes | 非達成件数 |
| currentTime | `string` | Yes | 現在時刻 |
| error | `boolean` | No | エラー状態（default: false） |

---

## ボタン

### BasicButton

プライマリボタン。

**ファイル**: `src/components/Buttons/BasicButton.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| onClick | `() => void` | Yes | クリックハンドラー |
| str | `string` | Yes | ボタンラベル |

---

### OutlinedButton

アウトラインボタン。

**ファイル**: `src/components/Buttons/BasicButton.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| onClick | `() => void` | Yes | クリックハンドラー |
| str | `string` | Yes | ボタンラベル |

---

### UploadButton

ファイルアップロードボタン。

**ファイル**: `src/components/Buttons/UploadButton.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| areaNames | `string[]` | Yes | 許可されるエリア名一覧 |
| error | `boolean` | No | エラー状態（default: false） |

**特徴**
- 複数ファイル選択対応
- エリア名によるファイルフィルタリング
- 重複ファイル除外
- アップロード進行状態表示

---

## ダイアログ

### EmptySendDialog

ファイル未選択時の警告ダイアログ。

**ファイル**: `src/components/EmptySendDialog.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| toggleDialog | `() => void` | Yes | ダイアログ開閉トグル |
| open | `boolean` | Yes | 開閉状態 |

---

### IncorrectUploadDialog

不正なファイル形式の警告ダイアログ。

**ファイル**: `src/components/IncorrectUploadDialog.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| toggleDialog | `() => void` | Yes | ダイアログ開閉トグル |
| open | `boolean` | Yes | 開閉状態 |
| areaNames | `string[]` | Yes | 許可されるエリア名一覧 |

---

## フォーム

### AreaListCheck

エリア選択チェックボックスリスト。

**ファイル**: `src/components/AreaListCheck.tsx`

**Props**: なし（useEffectでエリア取得）

**特徴**
- ローディング/エラー状態対応
- 再試行ボタン付き

---

### AreaChips

登録エリアのチップ表示。

**ファイル**: `src/components/AreaChips.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| areaNames | `string[]` | Yes | エリア名配列 |
| error | `boolean` | No | エラー状態（default: false） |

---

### RoleRadioButton

ロール選択ラジオボタン。

**ファイル**: `src/components/RoleRadioButton.tsx`

**Props**: なし（内部で状態管理）

---

## タスク詳細

### AdminDetail

管理者向けタスク詳細ビュー。

**ファイル**: `src/components/Details/AdminDetail.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| account | `AccountData` | Yes | アカウント情報 |
| comments | `Comment[]` | Yes | コメント配列 |
| cycleId | `number` | Yes | サイクルID |
| isLoaded | `boolean` | Yes | ロード完了状態 |
| error | `string \| null` | Yes | エラーメッセージ |
| onRetry | `() => void` | Yes | 再試行ハンドラー |
| url | `string` | Yes | ファイルURL |
| date | `string` | Yes | 日付 |
| id | `string` | Yes | 履歴ID |
| dataType | `string` | Yes | データタイプ |
| reload | `(newDataType: string) => void` | Yes | リロード関数 |
| mutate | `KeyedMutator<Task[]>` | Yes | SWR mutate |
| taskId | `number` | Yes | タスクID |

**特徴**
- NGタスク時のみ「再アサイン」ボタン表示

---

### MemberDetail

メンバー向けタスク詳細ビュー。

**ファイル**: `src/components/Details/MemberDetail.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| account | `AccountData` | Yes | アカウント情報 |
| comments | `Comment[]` | Yes | コメント配列 |
| isLoaded | `boolean` | Yes | ロード完了状態 |
| error | `string \| null` | Yes | エラーメッセージ |
| onRetry | `() => void` | Yes | 再試行ハンドラー |
| id | `string` | Yes | 履歴ID |
| cycleId | `number` | Yes | サイクルID |
| url | `string` | Yes | ファイルURL |
| date | `string` | Yes | 日付 |
| reload | `(newDataType: string) => void` | Yes | リロード関数 |
| mutate | `KeyedMutator<Task[]>` | Yes | SWR mutate |
| taskId | `number` | Yes | タスクID |

**特徴**
- 「完了」「NG」ボタン表示

---

## ユーティリティ

### Copyright

コピーライト表示。

**ファイル**: `src/components/Copyright.tsx`

**Props**: なし

---

### LoadCircle

ローディングスピナー。

**ファイル**: `src/components/LoadCircle.tsx`

**Props**: なし

---

### Title

セクションタイトル。

**ファイル**: `src/components/Title.tsx`

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| children | `React.ReactNode` | No | タイトルテキスト |

---

### ToastContainer

トースト通知コンテナ。

**ファイル**: `src/components/Toast.tsx`

**Props**: なし（useToastフック経由で制御）

**特徴**
- 複数トースト同時表示対応
- 再試行ボタン対応
- 自動消去

---

### ListItems

ナビゲーションリストアイテム。

**ファイル**: `src/components/ListItems.tsx`

**エクスポート**
- `MainListItems` - メインナビゲーション
- `SecondaryListItems` - セカンダリナビゲーション（レポート）

**Props**

| 名前 | 型 | 必須 | 説明 |
|------|-----|------|------|
| open | `boolean` | Yes | Drawer開閉状態 |

**特徴**
- 閉じた状態でツールチップ表示

---

## 型定義リファレンス

詳細な型定義は `src/types/index.ts` を参照してください。

| 型名 | 用途 |
|-----|------|
| `AccountData` | ユーザーアカウント情報 |
| `Task` / `TaskListItem` | タスク情報 |
| `Comment` | コメント情報 |
| `MemberStatus` | メンバーステータス |
| `Area` | エリア情報 |
