import { cookies } from 'next/headers';

import { logError, logWarn } from '@/src/util/safe-logger';

/**
 * 認証ヘッダー取得結果
 */
export type AuthHeadersResult =
  | { ok: true; headers: Record<string, string> }
  | { ok: false; reason: 'no_token' | 'cookie_error' };

/**
 * 認証ヘッダーを取得するユーティリティ
 * Server Actions/Route Handlersで使用
 *
 * @returns 認証ヘッダー取得結果（Result型でエラーを明示）
 */
export const getAuthHeaders = (): AuthHeadersResult => {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      logWarn('[getAuthHeaders]', '認証トークンが見つかりません - セッション期限切れの可能性');
      return { ok: false, reason: 'no_token' };
    }
    return { ok: true, headers: { Authorization: `Bearer ${token}` } };
  } catch (error) {
    logError('[getAuthHeaders] Cookie取得エラー', error);
    return { ok: false, reason: 'cookie_error' };
  }
};

/**
 * 認証ヘッダーを取得（後方互換性用）
 * 注意: 新規コードではgetAuthHeaders()を使用し、エラーを適切に処理すること
 *
 * @returns 認証ヘッダーオブジェクト（トークンがなければ空オブジェクト）
 * @deprecated getAuthHeaders()を使用してください
 */
export const getAuthHeadersUnsafe = (): Record<string, string> => {
  const result = getAuthHeaders();
  if (!result.ok) {
    return {};
  }
  return result.headers;
};
