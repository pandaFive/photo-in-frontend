'use server';

import { NextRequest, NextResponse } from 'next/server';

import { Comment } from '@/src/types';

type Body = {
  id: number;
  content: string;
  accountId: number;
  cycleId: number;
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
          assign_cycle_id: body.cycleId,
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
