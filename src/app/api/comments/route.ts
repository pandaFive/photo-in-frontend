'use server';

import { NextRequest, NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Comment } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { validateId } from '@/src/util/validation';

export const GET = async (request: NextRequest) => {
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
          ...getAuthHeaders(),
        },
      },
    );

    if (res.ok) {
      const result: Comment[] = (await res.json()) as Comment[];
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[GET] /api/comments:', errorMessage);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
