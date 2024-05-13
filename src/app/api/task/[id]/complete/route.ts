'use server';

import { NextResponse } from 'next/server';

type Result = {
  message: string;
  result: boolean;
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id: string = params.id;
  try {
    const res = await fetch(`${process.env.API_HOST}/tasks/${id}/completed`, {
      method: 'PUT',
      cache: 'no-store',
    });

    if (res.ok) {
      const result: Result = (await res.json()) as Result;
      return NextResponse.json(result);
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};
