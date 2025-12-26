'use server';

import { NextResponse } from 'next/server';

import { Task } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';

export const GET = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id = params.id;

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
      return NextResponse.json({ errors: [errorText || 'エラーが発生しました'] }, { status: res.status });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
