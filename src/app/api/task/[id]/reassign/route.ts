'use server';

import { NextResponse } from 'next/server';

export type Task = {
  [key: string]: string | number;
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id: string = params.id;
  try {
    const res = await fetch(`${process.env.API_HOST}/tasks/${id}/newCycle`, {
      method: 'POST',
      cache: 'no-store',
    });

    if (res.ok) {
      const result: Task = (await res.json()) as Task;
      return NextResponse.json(result);
    } else {
      return NextResponse.json({});
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};
