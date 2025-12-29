'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { ResponseStatus } from '@/src/types';
import { requireAdmin, requireAuth, requireValidId } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  // DRY-M01: 認証・認可・バリデーション共通化
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  const adminResult = requireAdmin();
  if (!adminResult.ok) return adminResult.response;

  const idResult = requireValidId(params.id);
  if (!idResult.ok) return idResult.response;
  const id = idResult.id;

  try {
    const res = await fetch(`${process.env.API_HOST}/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        ...auth.headers,
      },
    });

    if (res.ok) {
      let result: ResponseStatus;
      try {
        result = (await res.json()) as ResponseStatus;
      } catch (jsonErr) {
        logError(
          `[DELETE] /api/account/[id]: res.json() failed (content-type: ${res.headers.get('content-type')})`,
          jsonErr,
        );
        return NextResponse.json(
          { errors: ['バックエンドから不正なレスポンスを受信しました'] },
          { status: 502 },
        );
      }
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[DELETE] /api/account/[id]: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[DELETE] /api/account/[id]', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
