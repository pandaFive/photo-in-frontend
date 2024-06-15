'use server';

import { NextResponse } from 'next/server';

import { getTasks, Task } from '@/src/api/get-tasks';

export const GET = async () => {
  try {
    const res: Task[] = await getTasks();
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json(Array<Task>);
  }
};
