import { cookies } from 'next/headers';

/**
 * 認証ヘッダーを取得するユーティリティ
 * Server Actions/Route Handlersで使用
 *
 * @returns 認証ヘッダーオブジェクト（トークンがなければ空オブジェクト）
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = cookies().get('token')?.value;
  if (!token) {
    console.warn('[getAuthHeaders] 認証トークンが見つかりません');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};
