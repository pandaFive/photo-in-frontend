import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Task } from '@/src/types';
import { requireAuth } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

export const GET = async () => {
  // DRY-M01: 認証チェック共通化
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const res = await fetch(`${process.env.API_HOST}/tasks?type=ng`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        ...auth.headers,
      },
    });

    if (res.ok) {
      let result: Task[];
      try {
        result = (await res.json()) as Task[];
      } catch (jsonErr) {
        logError(
          `[GET] /api/tasks/ng: res.json() failed (content-type: ${res.headers.get('content-type')})`,
          jsonErr,
        );
        return NextResponse.json(
          { errors: ['バックエンドから不正なレスポンスを受信しました'] },
          { status: 502 },
        );
      }
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      });
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[GET] /api/tasks/ng: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[GET] /api/tasks/ng', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
