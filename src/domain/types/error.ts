/**
 * API エラー型
 * HTTPリクエストが失敗した場合（4xx, 5xx）
 */
export type ApiError = {
  type: 'api';
  status: number;
  message: string;
  details?: Record<string, unknown>;
};

/**
 * ネットワークエラー型
 * ネットワーク接続エラー、タイムアウト等
 */
export type NetworkError = {
  type: 'network';
  message: string;
};

/**
 * ドメインエラー型（統一エラー型）
 */
export type DomainError = ApiError | NetworkError;

/**
 * Result型
 * 成功/失敗を明示的に表現する型
 */
export type Result<T, E = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Result型のヘルパー関数
 */
export const ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * ApiErrorを生成するヘルパー
 */
export const createApiError = (
  status: number,
  message: string,
  details?: Record<string, unknown>,
): ApiError => ({
  type: 'api',
  status,
  message,
  details,
});

/**
 * NetworkErrorを生成するヘルパー
 */
export const createNetworkError = (message: string): NetworkError => ({
  type: 'network',
  message,
});

/**
 * DomainErrorかどうかを判定する型ガード
 */
export const isDomainError = (error: unknown): error is DomainError => {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as Record<string, unknown>;
  return e.type === 'api' || e.type === 'network';
};

/**
 * エラーを表示用文字列に変換
 */
export const toDisplayError = (error: DomainError): string => {
  switch (error.type) {
    case 'api':
      return `エラー (${String(error.status)}): ${error.message}`;
    case 'network':
      return `ネットワークエラー: ${error.message}`;
  }
};
