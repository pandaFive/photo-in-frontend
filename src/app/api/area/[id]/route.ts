/**
 * エリア削除API Route Handler
 *
 * DELETE /api/area/[id] - エリア削除
 */
import { NextRequest, NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { requireAdmin, requireAuth, requireValidId } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/area/[id] - エリア削除
 */
export const DELETE = async (_request: NextRequest, context: Context) => {
  // 認証チェック
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  // 管理者権限チェック
  const adminResult = requireAdmin();
  if (!adminResult.ok) return adminResult.response;

  // IDバリデーション
  const { id: idParam } = await context.params;
  const idResult = requireValidId(idParam);
  if (!idResult.ok) return idResult.response;
  const id = idResult.id;

  try {
    const res = await fetch(`${process.env.API_HOST}/areas/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
      headers: {
        ...auth.headers,
      },
    });

    if (res.ok) {
      try {
        const data: unknown = await res.json();
        return NextResponse.json(data);
      } catch (jsonError) {
        logError('[DELETE] /api/area/[id]: Success response JSON parse failed', jsonError);
        return NextResponse.json(
          { errors: ['サーバーからの応答を解析できませんでした'] },
          { status: 502 },
        );
      }
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[DELETE] /api/area/[id]: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[DELETE] /api/area/[id]', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
