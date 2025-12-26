'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Task } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { validateId } from '@/src/util/validation';

export const GET = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  // SEC-007: IDバリデーション（バウンドチェック含む）
  const idResult = validateId(params.id);
  if (!idResult.valid) {
    return NextResponse.json({ errors: [idResult.error] }, { status: 400 });
  }
  const id = idResult.id;

  try {
    const res = await fetch(`${process.env.API_HOST}/account/tasks?id=${id}`, {
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (res.ok) {
      const result: Task[] = (await res.json()) as Task[];
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[GET] /api/account/[id]/tasks:', errorMessage);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
