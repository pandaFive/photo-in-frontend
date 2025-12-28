/**
 * 認証・認可チェックユーティリティ
 * SEC-006: Route Handlersに認可チェック追加
 *
 * @server-only - これらの関数はServer Components/Route Handlersでのみ動作
 *
 * ⚠️ セキュリティ警告 ⚠️
 * このモジュールの認可チェック（isAdminFromCookie）はCookie値に依存しており、
 * クライアント側で改竄可能です。これはDefense in Depth（多層防御）の一層としてのみ使用し、
 * 必ずバックエンドAPIでも認可チェックを実施してください。
 *
 * @see Rails側: app/controllers/concerns/authorization.rb
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
 * ⚠️ セキュリティ警告 ⚠️
 * この関数はCookieの値を信頼するため、フロントエンドのみの防御です。
 * Cookieはクライアント側で改竄可能なため、この関数だけで認可を判断してはいけません。
 *
 * 必須: バックエンドAPIでも必ず認可チェックを実施すること
 * - Rails側: before_action :require_admin! を使用
 * - JWTトークンからユーザーロールを検証
 *
 * 用途:
 * - UI表示の制御（管理者メニューの表示/非表示）
 * - 早期リターンによるUX向上（不正リクエストの事前ブロック）
 *
 * @security この関数はDefense in Depth（多層防御）の補助層としてのみ使用
 * @returns 管理者ロールの場合true（Cookieが改竄されている可能性あり）
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
