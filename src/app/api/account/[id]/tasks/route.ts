'use server';

import { NextResponse } from 'next/server';

import { getAccountTasks, Task } from '@/src/api/get-account-tasks';

export const GET = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const id = params.id;

  try {
    const res: Task[] = await getAccountTasks(id);
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json(Array<Task>);
  }
};
