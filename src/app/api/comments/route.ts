'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { Comment } from '@/src/types';

/**
 * 認証ヘッダーを取得
 */
const getAuthHeader = (): Record<string, string> => {
  const token = cookies().get('token')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get('taskId');
  const accountId = searchParams.get('accountId');
  try {
    const res = await fetch(
      `${process.env.API_HOST}/comments?taskId=${taskId}&accountId=${accountId}`,
      {
        cache: 'no-store',
        headers: {
          ...getAuthHeader(),
        },
      },
    );

    if (res.ok) {
      const result: Comment[] = (await res.json()) as Comment[];
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
