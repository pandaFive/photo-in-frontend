'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { getAuthHeaders } from '@/src/util/auth-headers';

export type Task = {
  [key: string]: string | number;
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id: string = params.id;

  if (!id || id.trim() === '') {
    return NextResponse.json(
      { errors: ['IDが不正または未指定です'] },
      { status: 400 },
    );
  }

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
