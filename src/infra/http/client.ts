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
        const message = await res.text().catch(() => 'Unknown error');
        return err(createApiError(res.status, message));
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
        const message = await res.text().catch(() => 'Unknown error');
        return err(createApiError(res.status, message));
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
        const message = await res.text().catch(() => 'Unknown error');
        return err(createApiError(res.status, message));
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
        const message = await res.text().catch(() => 'Unknown error');
        return err(createApiError(res.status, message));
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
};
