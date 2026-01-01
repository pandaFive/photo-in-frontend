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

type RequestOptions<T = unknown> = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
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
 * HTTPクライアント
 * 全てのHTTPリクエストをResult型で返す
 */
export const httpClient = {
  /**
   * GETリクエスト
   */
  get: async <T>(
    url: string,
    options?: RequestOptions<T>,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: options?.signal,
        headers: options?.headers,
      });

      if (!res.ok) {
        const text = await res.text().catch((e) => {
          logError('[httpClient.get] res.text() failed', e);
          return '';
        });
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      // GETは空レスポンスの場合がある
      const text = await res.text();
      if (!text) {
        return ok({} as T);
      }

      try {
        const data: unknown = JSON.parse(text);
        return validateWithSchema(data, options?.schema);
      } catch (jsonErr) {
        // JSONパースに失敗した場合はエラーを返す（サイレント失敗防止）
        logError('[httpClient.get] JSON.parse failed', jsonErr);
        return err(createApiError(502, 'サーバーからの応答を解析できませんでした'));
      }
    } catch (e) {
      // AbortErrorは再throwして呼び出し側でハンドリング
      if (e instanceof Error && e.name === 'AbortError') {
        throw e;
      }
      return err(createNetworkError(String(e)));
    }
  },

  /**
   * POSTリクエスト
   */
  post: async <T>(
    url: string,
    body?: unknown,
    options?: RequestOptions<T>,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: options?.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const text = await res.text().catch((e) => {
          logError('[httpClient.post] res.text() failed', e);
          return '';
        });
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      // POSTは空レスポンスの場合がある
      const text = await res.text();
      if (!text) {
        return ok({} as T);
      }

      try {
        const data: unknown = JSON.parse(text);
        return validateWithSchema(data, options?.schema);
      } catch (jsonErr) {
        // JSONパースに失敗した場合はエラーを返す（サイレント失敗防止）
        logError('[httpClient.post] JSON.parse failed', jsonErr);
        return err(createApiError(502, 'サーバーからの応答を解析できませんでした'));
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw e;
      }
      return err(createNetworkError(String(e)));
    }
  },

  /**
   * PUTリクエスト
   */
  put: async <T>(
    url: string,
    body?: unknown,
    options?: RequestOptions<T>,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        signal: options?.signal,
        headers: body
          ? {
              'Content-Type': 'application/json',
              ...options?.headers,
            }
          : options?.headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const text = await res.text().catch((e) => {
          logError('[httpClient.put] res.text() failed', e);
          return '';
        });
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      // PUTは空レスポンスの場合がある
      const text = await res.text();
      if (!text) {
        return ok({} as T);
      }

      try {
        const data: unknown = JSON.parse(text);
        return validateWithSchema(data, options?.schema);
      } catch (jsonErr) {
        // JSONパースに失敗した場合はエラーを返す（サイレント失敗防止）
        logError('[httpClient.put] JSON.parse failed', jsonErr);
        return err(createApiError(502, 'サーバーからの応答を解析できませんでした'));
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw e;
      }
      return err(createNetworkError(String(e)));
    }
  },

  /**
   * DELETEリクエスト
   */
  delete: async <T>(
    url: string,
    options?: RequestOptions<T>,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        signal: options?.signal,
        headers: options?.headers,
      });

      if (!res.ok) {
        const text = await res.text().catch((e) => {
          logError('[httpClient.delete] res.text() failed', e);
          return '';
        });
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      // DELETEは空レスポンスの場合がある
      const text = await res.text();
      if (!text) {
        return ok({} as T);
      }

      try {
        const data: unknown = JSON.parse(text);
        return validateWithSchema(data, options?.schema);
      } catch (jsonErr) {
        // JSONパースに失敗した場合はエラーを返す（サイレント失敗防止）
        logError('[httpClient.delete] JSON.parse failed', jsonErr);
        return err(createApiError(502, 'サーバーからの応答を解析できませんでした'));
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw e;
      }
      return err(createNetworkError(String(e)));
    }
  },

  /**
   * FormDataをPOSTするリクエスト（ファイルアップロード用）
   * Content-Typeはブラウザが自動設定（multipart/form-data + boundary）
   */
  postFormData: async <T>(
    url: string,
    formData: FormData,
    options?: RequestOptions<T>,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: options?.signal,
        headers: options?.headers, // Content-Typeは設定しない
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text().catch((e) => {
          logError('[httpClient.postFormData] res.text() failed', e);
          return '';
        });
        return err(createApiError(res.status, parseErrorMessage(errorText)));
      }

      // 空レスポンスの場合がある
      const text = await res.text();
      if (!text) {
        return ok({} as T);
      }

      try {
        const data: unknown = JSON.parse(text);
        return validateWithSchema(data, options?.schema);
      } catch (jsonErr) {
        // JSONパースに失敗した場合はエラーを返す（サイレント失敗防止）
        logError('[httpClient.postFormData] JSON.parse failed', jsonErr);
        return err(createApiError(502, 'サーバーからの応答を解析できませんでした'));
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw e;
      }
      return err(createNetworkError(String(e)));
    }
  },
};
