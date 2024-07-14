'use server';

import { NextResponse } from 'next/server';

import { ResponseStatus } from '@/src/types';

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id = params.id;

  try {
    const res = await fetch(`${process.env.API_HOST}/accounts/${id}`, {
      method: 'DELETE',
    });
    const result: ResponseStatus = (await res.json()) as ResponseStatus;
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({});
  }
};
