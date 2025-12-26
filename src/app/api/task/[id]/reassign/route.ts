'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { validateId } from '@/src/util/validation';

export type Task = {
  [key: string]: string | number;
};

export const PUT = async (
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
    const res = await fetch(`${process.env.API_HOST}/tasks/${id}/newCycle`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (res.ok) {
      const result: Task = (await res.json()) as Task;
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[PUT] /api/task/[id]/reassign:', errorMessage);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
