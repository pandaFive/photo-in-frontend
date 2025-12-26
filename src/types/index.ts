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
 */
export const isErrorResponse = (value: unknown): value is ErrorResponse =>
  typeof value === 'object' &&
  value !== null &&
  'errors' in value &&
  Array.isArray((value as ErrorResponse).errors);

export type ApiResult<T> = T | ErrorResponse;

// API固有のレスポンス型
export type CommentApiResponse = {
  [key: string]: string;
};

export type WeekCompleteData = {
  [key: string]: number;
};
