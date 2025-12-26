'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Task } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';

export const GET = async () => {
  try {
    const res = await fetch(`${process.env.API_HOST}/tasks?type=ng`, {
      method: 'GET',
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
    console.error('[GET] /api/tasks/ng:', errorMessage);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
