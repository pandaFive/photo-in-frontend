/**
 * 認証・認可チェックユーティリティ
 * SEC-006: Route Handlersに認可チェック追加
 */

import { cookies } from 'next/headers';

/**
 * 認証チェック: トークンの有無を確認
 * @returns トークンがあればtrue
 */
export const isAuthenticated = (): boolean => {
  const token = cookies().get('token')?.value;
  return !!token;
};

/**
 * 認可チェック: 管理者権限を確認
 * 注意: バックエンドでも必ず認可チェックを実施すること（Defense in Depth）
 * @returns 管理者ロールの場合true
 */
export const isAdminFromCookie = (): boolean => {
  const role = cookies().get('role')?.value;
  return role === 'admin';
};
