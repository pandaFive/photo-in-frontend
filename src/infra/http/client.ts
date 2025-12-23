import {
  Result,
  ok,
  err,
  createApiError,
  createNetworkError,
} from '@/src/domain/types/error';

type RequestOptions = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

/**
 * エラーレスポンスからメッセージを抽出
 * { errors: string[] } 形式と旧形式の両方に対応
 */
const parseErrorMessage = (text: string): string => {
  if (!text) return 'Unknown error';
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    if (Array.isArray(json.errors)) {
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
  get: async <T>(url: string, options?: RequestOptions): Promise<Result<T>> => {
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

      const data = (await res.json()) as T;
      return ok(data);
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
    options?: RequestOptions,
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

      const data = (await res.json()) as T;
      return ok(data);
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
    options?: RequestOptions,
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
        const data = JSON.parse(text) as T;
        return ok(data);
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
    options?: RequestOptions,
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
        const data = JSON.parse(text) as T;
        return ok(data);
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
    options?: RequestOptions,
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
        const data = JSON.parse(text) as T;
        return ok(data);
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
