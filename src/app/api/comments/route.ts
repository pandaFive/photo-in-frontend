'use server';

import { NextRequest, NextResponse } from 'next/server';

import { Comment } from '@/src/types';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get('taskId');
  const accountId = searchParams.get('accountId');
  try {
    const res = await fetch(
      `${process.env.API_HOST}/comments?taskId=${taskId}&accountId=${accountId}`,
      {
        cache: 'no-store',
      },
    );

    if (res.ok) {
      const result: Comment[] = (await res.json()) as Comment[];
      return NextResponse.json(result);
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};
