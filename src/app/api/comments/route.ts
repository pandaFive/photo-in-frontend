'use server';

import { NextRequest, NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Comment } from '@/src/types';
import { requireAuth } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';
import { validateId } from '@/src/util/validation';

export const GET = async (request: NextRequest) => {
  // DRY-M01: 認証チェック共通化
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  const searchParams = request.nextUrl.searchParams;
  const taskIdParam = searchParams.get('taskId');
  const accountIdParam = searchParams.get('accountId');

  // SEC-007: IDバリデーション（バウンドチェック含む）
  const taskIdResult = validateId(taskIdParam);
  if (!taskIdResult.valid) {
    return NextResponse.json(
      { errors: [`taskId: ${taskIdResult.error}`] },
      { status: 400 },
    );
  }

  const accountIdResult = validateId(accountIdParam);
  if (!accountIdResult.valid) {
    return NextResponse.json(
      { errors: [`accountId: ${accountIdResult.error}`] },
      { status: 400 },
    );
  }

  const taskId = taskIdResult.id;
  const accountId = accountIdResult.id;

  try {
    const res = await fetch(
      `${process.env.API_HOST}/comments?taskId=${taskId}&accountId=${accountId}`,
      {
        cache: 'no-store',
        headers: {
          ...auth.headers,
        },
      },
    );

    if (res.ok) {
      let result: Comment[];
      try {
        result = (await res.json()) as Comment[];
      } catch (jsonErr) {
        logError(
          `[GET] /api/comments: res.json() failed (content-type: ${res.headers.get('content-type')})`,
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
        logError('[GET] /api/comments: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[GET] /api/comments', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
