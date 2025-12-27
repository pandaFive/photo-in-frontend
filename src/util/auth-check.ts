/**
 * 認証・認可チェックユーティリティ
 * SEC-006: Route Handlersに認可チェック追加
 *
 * @server-only - これらの関数はServer Components/Route Handlersでのみ動作
 */

import { cookies } from 'next/headers';

import { logError } from '@/src/util/safe-logger';

/**
 * 認証チェック: トークンの有無を確認
 *
 * 注意: cookies()はServer Component外で呼ばれると例外をスローする可能性がある
 * その場合はfalseを返す（Fail secure: 認証なしとして扱う）
 *
 * @returns トークンがあればtrue
 */
export const isAuthenticated = (): boolean => {
  try {
    const token = cookies().get('token')?.value;
    return !!token;
  } catch (error) {
    logError('[isAuthenticated] Cookie取得エラー', error);
    return false;
  }
};

/**
 * 認可チェック: 管理者権限を確認
 *
 * 警告: この関数はCookieの値を信頼するため、フロントエンドのみの防御です。
 * Cookieはクライアント側で改竄可能なため、バックエンドでも必ず認可チェックを実施すること。
 * （Defense in Depth: 多層防御の原則）
 *
 * @returns 管理者ロールの場合true
 */
export const isAdminFromCookie = (): boolean => {
  try {
    const role = cookies().get('role')?.value;
    return role === 'admin';
  } catch (error) {
    logError('[isAdminFromCookie] Cookie取得エラー', error);
    return false;
  }
};
