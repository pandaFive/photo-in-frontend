export type Task = {
  id: number;
  task_title: string;
  area_name: string;
  history_id: number;
  assign_cycle_id: number;
  created_at: string;
};

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

export type GroupType = {
  [key: string]: Task[];
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
 * Mutation操作の結果型（判別共用体）
 * TYPE-001: 不正な状態（success: true かつ error が存在）を型レベルで防止
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
 */
export type MutationResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };
