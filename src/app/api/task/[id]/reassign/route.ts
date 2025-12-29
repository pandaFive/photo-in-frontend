'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Task } from '@/src/types';
import { requireAuth, requireValidId } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

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
    const res = await fetch(`${process.env.API_HOST}/tasks/${id}/newCycle`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        ...auth.headers,
      },
    });

    if (res.ok) {
      let result: Task;
      try {
        result = (await res.json()) as Task;
      } catch (jsonErr) {
        logError(
          `[PUT] /api/task/[id]/reassign: res.json() failed (content-type: ${res.headers.get('content-type')})`,
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
        logError('[PUT] /api/task/[id]/reassign: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[PUT] /api/task/[id]/reassign', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
