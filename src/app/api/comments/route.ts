'use server';

import { NextRequest, NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Comment } from '@/src/types';
import { isAuthenticated } from '@/src/util/auth-check';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { logError } from '@/src/util/safe-logger';
import { validateId } from '@/src/util/validation';

export const GET = async (request: NextRequest) => {
  // SEC-006: 認証チェック
  if (!isAuthenticated()) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

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

  // 認証ヘッダー取得
  const authResult = getAuthHeaders();
  if (!authResult.ok) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.API_HOST}/comments?taskId=${taskId}&accountId=${accountId}`,
      {
        cache: 'no-store',
        headers: {
          ...authResult.headers,
        },
      },
    );

    if (res.ok) {
      const result: Comment[] = (await res.json()) as Comment[];
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      });
    } else {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[GET] /api/comments', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
