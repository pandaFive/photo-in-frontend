/**
 * Accounts API Route Handler
 *
 * GET /api/accounts - メンバー一覧取得
 */
import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { MemberStatus } from '@/src/types';
import { requireAdmin, requireAuth } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

/**
 * GET /api/accounts - メンバー一覧取得
 */
export const GET = async () => {
  // 認証チェック
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  // 管理者権限チェック
  const adminResult = requireAdmin();
  if (!adminResult.ok) return adminResult.response;

  try {
    const res = await fetch(`${process.env.API_HOST}/accounts`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        ...auth.headers,
      },
    });

    if (res.ok) {
      let result: MemberStatus[];
      try {
        result = (await res.json()) as MemberStatus[];
      } catch (jsonErr) {
        logError(
          `[GET] /api/accounts: res.json() failed (content-type: ${res.headers.get('content-type')})`,
          jsonErr,
        );
        return NextResponse.json(
          { errors: ['バックエンドから不正なレスポンスを受信しました'] },
          { status: 502 },
        );
      }
      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[GET] /api/accounts: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[GET] /api/accounts', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
