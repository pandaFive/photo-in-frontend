'use server';

import { NextRequest, NextResponse } from 'next/server';

import { Comment, CommentApiResponse } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';

type Body = {
  id: number;
  content: string;
  taskId: number;
};

export const POST = async (request: NextRequest) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { errors: ['リクエストボディのJSON形式が不正です'] },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/comments`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        comment: {
          content: body.content,
          task_id: body.taskId,
        },
      }),
    });
    if (res.ok) {
      const result: Comment = (await res.json()) as Comment;
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

export const PUT = async (request: NextRequest) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { errors: ['リクエストボディのJSON形式が不正です'] },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${body.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
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
      const errorText = await res.text().catch(() => '');
      return NextResponse.json({ errors: [errorText || 'エラーが発生しました'] }, { status: res.status });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};

export const DELETE = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const commentId = searchParams.get('commentId');

  if (!commentId || isNaN(Number(commentId))) {
    return NextResponse.json(
      { errors: ['commentIdが不正または未指定です'] },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${commentId}`, {
      method: 'DELETE',
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (res.ok) {
      const result: CommentApiResponse = (await res.json()) as CommentApiResponse;
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
