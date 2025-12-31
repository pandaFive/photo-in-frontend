/**
 * TYPE-002: Task型の分離
 *
 * バックエンドのPresenterごとに返却フィールドが異なるため、
 * フロントエンドでも型を分離してtype safetyを確保する。
 *
 * @see photo-in-backend/app/presenters/task_presenter.rb
 */

// バックエンドAPIレスポンス型のre-export
export type { CommentApiResponse } from './api-responses';

/**
 * タスク共通フィールド（全レスポンスで共通）
 */
export type BaseTask = {
  id: number;
  task_title: string;
  area_name: string;
  created_at: string;
};

/**
 * アサイン済みタスク一覧用（メンバー/NGタスク一覧）
 *
 * @see render_account_assign_tasks - /account/tasks?id=X
 * @see render_ng_tasks - /tasks?type=ng
 */
export type TaskListItem = BaseTask & {
  history_id: number;
  assign_cycle_id: number;
};

/**
 * アクティブタスク一覧用（管理者の全タスク一覧）
 * history_idは含まれない（アサインサイクルのみ）
 *
 * @see render_active_tasks - /tasks?type=all
 */
export type ActiveTask = BaseTask & {
  assign_cycle_id: number;
};

/**
 * タスク詳細/作成/更新レスポンス用
 * history_id/assign_cycle_idは含まれない
 *
 * @see render_task - /tasks/:id (show/create/update)
 */
export type TaskDetail = BaseTask & {
  area_id: number;
  updated_at: string;
};

/**
 * 後方互換性のためのエイリアス
 * 新規コードではTaskListItemを使用すること
 *
 * @deprecated TaskListItemを使用
 */
export type Task = TaskListItem;

export type Comment = {
  id: number;
  name: string;
  content: string;
  taskId: number;
  updatedAt: string;
  accountName: string;
  role: string;
};

export type AccountData = {
  id: number;
  name: string;
  area: string[];
  role: string;
  token: string;
};

export type Area = {
  id: number;
  name: string;
};

export type MemberStatus = {
  id: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  area: string[];
  total: number;
  week: number;
  ng_rate: number;
  assign: number;
};

export type ResponseStatus = {
  [key: string]: string;
};

/**
 * タスクグルーピング結果型
 * TaskListItem（アサイン済みタスク）のグルーピングに使用
 */
export type GroupType = {
  [key: string]: TaskListItem[];
};

export type GroupKey = 'time' | 'area';

// API共通型
export interface ErrorResponse {
  errors: string[];
}

/**
 * ErrorResponseかどうかを判定する型ガード
 * errors配列の要素が全てstring型であることも検証する
 */
export const isErrorResponse = (value: unknown): value is ErrorResponse =>
  typeof value === 'object' &&
  value !== null &&
  'errors' in value &&
  Array.isArray((value as ErrorResponse).errors) &&
  (value as ErrorResponse).errors.every((e) => typeof e === 'string');

export type ApiResult<T> = T | ErrorResponse;

// API固有のレスポンス型
// CODE-008: 削除レスポンスの型を厳格化
export type CommentApiResponse = {
  message: string;
};

export type WeekCompleteData = {
  [key: string]: number;
};

// Mutation共通型
// CODE-003: 3箇所に重複定義されていた型を統合

/**
 * エラータイプ（DomainErrorのtype属性を反映）
 * TYPE-006: mutation層でエラー種別を保持するため追加
 */
export type MutationErrorType = 'api' | 'network' | 'validation';

/**
 * Mutation操作の結果型（判別共用体）
 * TYPE-001: 不正な状態（success: true かつ error が存在）を型レベルで防止
 * TYPE-006: エラー時にerrorType, statusCodeを保持し、DomainError情報を維持
 *
 * @template T - 成功時に返却されるデータの型（デフォルト: undefined）
 *
 * @example
 * // データを返さない場合
 * const result: MutationResult = { success: true, data: undefined };
 * const error: MutationResult = { success: false, error: 'エラーメッセージ' };
 *
 * @example
 * // データを返す場合
 * const result: MutationResult<User> = { success: true, data: user };
 * const error: MutationResult<User> = { success: false, error: 'エラーメッセージ' };
 *
 * @example
 * // エラー種別を活用
 * if (!result.success && result.errorType === 'api' && result.statusCode === 401) {
 *   redirectToLogin();
 * }
 */
export type MutationResult<T = undefined> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      /** エラー種別（api/network/validation） */
      errorType?: MutationErrorType;
      /** APIエラー時のHTTPステータスコード */
      statusCode?: number;
    };
