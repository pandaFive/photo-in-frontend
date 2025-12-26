'use server';

import { NextResponse } from 'next/server';

import { Area } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';

export const GET = async () => {
  try {
    const res = await fetch(`${process.env.API_HOST}/areas`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (res.ok) {
      const result: Area[] = (await res.json()) as Area[];
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
