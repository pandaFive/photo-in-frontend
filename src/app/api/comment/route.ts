'use server';

import { NextRequest, NextResponse } from 'next/server';

import { Comment } from '@/src/types';

export type Res = {
  [key: string]: string;
};

type Body = {
  id: number;
  content: string;
  accountId: number;
  taskId: number;
};

export const POST = async (request: NextRequest) => {
  const body: Body = (await request.json()) as Body;
  try {
    const res = await fetch(`${process.env.API_HOST}/comments`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: {
          content: body.content,
          account_id: body.accountId,
          task_id: body.taskId,
        },
      }),
    });
    if (res.ok) {
      const result: Comment = (await res.json()) as Comment;
      return NextResponse.json(result);
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};

export const PUT = async (request: NextRequest) => {
  const body: Body = (await request.json()) as Body;
  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${body.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: {
          id: body.id,
          content: body.content,
        },
      }),
    });
    if (res.ok) {
      const result: Comment = (await res.json()) as Comment;
      return NextResponse.json(result);
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};

export const DELETE = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const commentId = searchParams.get('commentId');

  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${commentId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (res.ok) {
      const result: Res = (await res.json()) as Res;
      return NextResponse.json(result);
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};
