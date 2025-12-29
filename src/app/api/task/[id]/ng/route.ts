import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { requireAuth, requireValidId } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

type Result = {
  message: string;
  result: boolean;
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  // DRY-M01: 認証・バリデーション共通化
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  const idResult = requireValidId(params.id);
  if (!idResult.ok) return idResult.response;
  const id = idResult.id;

  try {
    const res = await fetch(`${process.env.API_HOST}/tasks/${id}/ng`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        ...auth.headers,
      },
    });

    if (res.ok) {
      let result: Result;
      try {
        result = (await res.json()) as Result;
      } catch (jsonErr) {
        logError(
          `[PUT] /api/task/[id]/ng: res.json() failed (content-type: ${res.headers.get('content-type')})`,
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
        logError('[PUT] /api/task/[id]/ng: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[PUT] /api/task/[id]/ng', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
