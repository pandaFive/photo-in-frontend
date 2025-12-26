'use server';

import { NextResponse } from 'next/server';

import { ResponseStatus } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id = params.id;

  try {
    const res = await fetch(`${process.env.API_HOST}/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (res.ok) {
      const result: ResponseStatus = (await res.json()) as ResponseStatus;
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
