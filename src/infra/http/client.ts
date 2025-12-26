import { z } from 'zod';

import {
  Result,
  ok,
  err,
  createApiError,
  createNetworkError,
} from '@/src/domain/types/error';

type RequestOptions<T = unknown> = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  /** オプショナルなzodスキーマ。指定時はレスポンスをバリデーション */
  schema?: z.ZodSchema<T>;
};

/**
 * zodスキーマでデータをバリデーション
 * スキーマが未指定の場合はそのまま返す（後方互換性）
 */
const validateWithSchema = <T>(
  data: unknown,
  schema?: z.ZodSchema<T>,
): Result<T> => {
  if (!schema) {
    return ok(data as T);
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return ok(result.data);
  }
  // Zod 4は issues、Zod 3は errors を使用
  const issues = result.error.issues ?? result.error.errors ?? [];
  const message = issues.map((e: { message: string }) => e.message).join(', ');
  return err(createApiError(422, `Validation error: ${message}`));
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
const parseErrorMessage = (text: string): string => {
  if (!text) return 'Unknown error';
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    if (Array.isArray(json.errors) && json.errors.length > 0) {
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
        const text = await res.text().catch(() => '');
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      const data: unknown = await res.json();
      return validateWithSchema(data, options?.schema);
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
        const text = await res.text().catch(() => '');
        return err(createApiError(res.status, parseErrorMessage(text)));
      }

      const data: unknown = await res.json();
      return validateWithSchema(data, options?.schema);
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
        const text = await res.text().catch(() => '');
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
      } catch {
        return ok({} as T);
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
        const text = await res.text().catch(() => '');
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
      } catch {
        return ok({} as T);
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
        const errorText = await res.text().catch(() => '');
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
      } catch {
        return ok({} as T);
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        throw e;
      }
      return err(createNetworkError(String(e)));
    }
  },
};
