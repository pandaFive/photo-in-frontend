'use server';

import { NextResponse } from 'next/server';

import { Task } from '@/src/types';

export const GET = async () => {
  try {
    const res = await fetch(`${process.env.API_HOST}/tasks?type=ng`, {
      method: 'GET',
      cache: 'no-store',
    });

    const result: Task[] = (await res.json()) as Task[];
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(Array<Task>);
  }
};
