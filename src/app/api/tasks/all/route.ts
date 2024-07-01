'use server';

import { NextResponse } from 'next/server';

import { getTasks } from '@/src/api/get-tasks';
import { Task } from '@/src/types';

export const GET = async () => {
  try {
    const res: Task[] = await getTasks();
    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json(Array<Task>);
  }
};
