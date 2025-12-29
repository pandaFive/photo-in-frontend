/**
 * Route Handler用の共通ヘルパー関数
 * DRY-M01: 認証・認可・バリデーションパターンの共通化
 */

import { NextResponse } from 'next/server';

import { isAuthenticated, isAdminFromCookie } from './auth-check';
import { getAuthHeaders } from './auth-headers';
import { logDebug, logWarn } from './safe-logger';
import { validateId } from './validation';

/**
 * 認証結果の型
 */
type AuthResult =
  | { ok: true; headers: Record<string, string> }
  | { ok: false; response: NextResponse };

/**
 * 認証チェックと認証ヘッダー取得を一括で行う
 * 認証失敗時はNextResponseを返す
 *
 * @example
 * const auth = requireAuth();
 * if (!auth.ok) return auth.response;
 * // auth.headers で認証ヘッダーを使用
 */
export const requireAuth = (): AuthResult => {
  if (!isAuthenticated()) {
    // LOG-001: 認証失敗ログ
    logWarn('[requireAuth]', '認証トークンが存在しません');
    return {
      ok: false,
      response: NextResponse.json(
        { errors: ['認証が必要です'] },
        { status: 401 },
      ),
    };
  }

  const authResult = getAuthHeaders();
  if (!authResult.ok) {
    // AUTH-001: cookie_errorとno_tokenを区別
    if (authResult.reason === 'cookie_error') {
      // Cookie取得でエラー発生 → サーバー側の問題
      logWarn('[requireAuth]', '認証ヘッダー取得失敗: Cookie取得エラー');
      return {
        ok: false,
        response: NextResponse.json(
          { errors: ['サーバーエラーが発生しました'] },
          { status: 500 },
        ),
      };
    }
    // no_token → 通常の認証エラー
    logWarn('[requireAuth]', '認証ヘッダー取得失敗: トークンなし');
    return {
      ok: false,
      response: NextResponse.json(
        { errors: ['認証が必要です'] },
        { status: 401 },
      ),
    };
  }

  return { ok: true, headers: authResult.headers };
};

/**
 * TYPE-005: 管理者権限チェック結果の型（判別共用体）
 * requireAuth, requireValidIdと同じパターンに統一
 */
type AdminResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * 管理者権限チェック
 * 権限がない場合はNextResponseを返す
 *
 * @example
 * const adminResult = requireAdmin();
 * if (!adminResult.ok) return adminResult.response;
 */
export const requireAdmin = (): AdminResult => {
  if (!isAdminFromCookie()) {
    // LOG-004: 認可失敗ログ（セキュリティ監視用）
    logWarn('[requireAdmin]', '管理者権限が必要な操作への非管理者アクセス試行');
    return {
      ok: false,
      response: NextResponse.json(
        { errors: ['この操作には管理者権限が必要です'] },
        { status: 403 },
      ),
    };
  }
  return { ok: true };
};

/**
 * IDバリデーション結果の型
 */
type ValidateIdResult =
  | { ok: true; id: number }
  | { ok: false; response: NextResponse };

/**
 * IDパラメータのバリデーションとエラーレスポンス生成
 *
 * @example
 * const idResult = requireValidId(params.id);
 * if (!idResult.ok) return idResult.response;
 * const id = idResult.id;
 */
export const requireValidId = (idParam: string): ValidateIdResult => {
  const result = validateId(idParam);
  if (!result.valid) {
    // LOG-005: IDバリデーション失敗ログ（デバッグ用）
    logDebug('[requireValidId]', `IDバリデーション失敗: ${result.error}`);
    return {
      ok: false,
      response: NextResponse.json(
        { errors: [result.error] },
        { status: 400 },
      ),
    };
  }
  return { ok: true, id: result.id };
};
