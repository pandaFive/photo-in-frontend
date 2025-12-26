'use server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { Task } from '@/src/types';

/**
 * 認証ヘッダーを取得
 */
const getAuthHeader = (): Record<string, string> => {
  const token = cookies().get('token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const GET = async () => {
  try {
    const res = await fetch(`${process.env.API_HOST}/tasks?type=all`, {
      cache: 'no-store',
      headers: {
        ...getAuthHeader(),
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
