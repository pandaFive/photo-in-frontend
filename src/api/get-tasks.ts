'use server';

import { Task } from '../types';

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${process.env.API_HOST}/tasks?type=all`, {
    next: { revalidate: 60 }, // 1分ごとに再検証
  });

  if (res.ok) {
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } else {
    return [];
  }
}
