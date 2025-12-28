/**
 * Server Actions用HTTPクライアント
 * Next.js Server Components/Actionsから外部APIを呼び出す際に使用
 */

import { z } from 'zod';

import {
  Result,
  ok,
  err,
  createApiError,
  createNetworkError,
} from '@/src/domain/types/error';
import { validateResponse } from '@/src/infra/validation';
import { parseErrorMessage } from '@/src/util/parse-error';
import { logError } from '@/src/util/safe-logger';

// 後方互換性のため再エクスポート
export { parseErrorMessage };

type CacheOption = 'force-cache' | 'no-store';

type ServerRequestOptions<T = unknown> = {
  headers?: Record<string, string>;
  cache?: CacheOption;
  revalidate?: number; // seconds
  /** オプショナルなzodスキーマ。指定時はレスポンスをバリデーション */
  schema?: z.ZodSchema<T>;
};

/**
 * zodスキーマでデータをバリデーション
 * スキーマが未指定の場合はそのまま返す（後方互換性）
 * CODE-002: validateResponseを使用して重複を排除
 */
const validateWithSchema = <T>(
  data: unknown,
  schema?: z.ZodSchema<T>,
): Result<T> => {
  if (!schema) {
    return ok(data as T);
  }
  return validateResponse(schema, data);
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
    options?: ServerRequestOptions<T>,
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
        const text = await res.text().catch((e) => {
          logError('[serverHttpClient.get] res.text() failed', e);
          return '';
        });
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      let data: unknown;
      try {
        data = await res.json();
      } catch (jsonErr) {
        logError('[serverHttpClient.get] res.json() failed', jsonErr);
        return err(
          createApiError(502, 'バックエンドから不正なレスポンスを受信しました'),
        );
      }
      return validateWithSchema(data, options?.schema);
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
    options?: ServerRequestOptions<T>,
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
        const text = await res.text().catch((e) => {
          logError('[serverHttpClient.post] res.text() failed', e);
          return '';
        });
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      let data: unknown;
      try {
        data = await res.json();
      } catch (jsonErr) {
        logError('[serverHttpClient.post] res.json() failed', jsonErr);
        return err(
          createApiError(502, 'バックエンドから不正なレスポンスを受信しました'),
        );
      }
      return validateWithSchema(data, options?.schema);
    } catch (e) {
      return err(createNetworkError(String(e)));
    }
  },
};
