/**
 * Server Actions用HTTPクライアント
 * Next.js Server Components/Actionsから外部APIを呼び出す際に使用
 */

import {
  Result,
  ok,
  err,
  createApiError,
  createNetworkError,
} from '@/src/domain/types/error';

type CacheOption = 'force-cache' | 'no-store';

type ServerRequestOptions = {
  headers?: Record<string, string>;
  cache?: CacheOption;
  revalidate?: number; // seconds
};

/**
 * エラーレスポンスからメッセージを抽出
 *
 * 対応形式:
 * - { errors: string[] } - 配列要素をカンマ区切りで結合
 * - { message: string } - messageプロパティを返却
 * - { error: string } - errorプロパティを返却
 * - 上記以外のJSON/非JSON - 元のテキストをそのまま返却
 *
 * @param text - エラーレスポンスのボディテキスト
 * @returns 抽出されたエラーメッセージ、空の場合は'Unknown error'
 */
export const parseErrorMessage = (text: string): string => {
  if (!text) return 'Unknown error';
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    if (Array.isArray(json.errors)) {
      // 空配列の場合はUnknown errorを返す
      if (json.errors.length === 0) {
        return 'Unknown error';
      }
      return (json.errors as string[]).join(', ');
    }
    if (typeof json.message === 'string') {
      return json.message;
    }
    if (typeof json.error === 'string') {
      return json.error;
    }
  } catch {
    // JSONパースに失敗した場合はそのままテキストを返す
  }
  return text;
};

/**
 * API_HOSTを取得（環境変数）
 */
const getApiHost = (): string => {
  const host = process.env.API_HOST;
  if (!host) {
    throw new Error('API_HOST environment variable is not set');
  }
  return host;
};

/**
 * Next.js fetch optionsを構築
 */
const buildFetchOptions = (
  options?: ServerRequestOptions,
): RequestInit & { next?: { revalidate: number } } => {
  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {};

  if (options?.cache) {
    fetchOptions.cache = options.cache;
  }

  if (options?.revalidate !== undefined) {
    fetchOptions.next = { revalidate: options.revalidate };
  }

  return fetchOptions;
};

/**
 * Server Actions用HTTPクライアント
 * 全てのHTTPリクエストをResult型で返す
 */
export const serverHttpClient = {
  /**
   * GETリクエスト
   */
  get: async <T>(
    path: string,
    options?: ServerRequestOptions,
  ): Promise<Result<T>> => {
    try {
      const url = `${getApiHost()}${path}`;
      const fetchOptions = buildFetchOptions(options);

      const res = await fetch(url, {
        method: 'GET',
        headers: options?.headers,
        ...fetchOptions,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      const data = (await res.json()) as T;
      return ok(data);
    } catch (e) {
      return err(createNetworkError(String(e)));
    }
  },

  /**
   * POSTリクエスト
   */
  post: async <T>(
    path: string,
    body?: unknown,
    options?: ServerRequestOptions,
  ): Promise<Result<T>> => {
    try {
      const url = `${getApiHost()}${path}`;
      const fetchOptions = buildFetchOptions(options);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...fetchOptions,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      const data = (await res.json()) as T;
      return ok(data);
    } catch (e) {
      return err(createNetworkError(String(e)));
    }
  },
};
