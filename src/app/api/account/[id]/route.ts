'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { ResponseStatus } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id = params.id;

  if (!id || id.trim() === '') {
    return NextResponse.json(
      { errors: ['IDが不正または未指定です'] },
      { status: 400 },
    );
  }

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
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[DELETE] /api/account/[id]:', errorMessage);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
