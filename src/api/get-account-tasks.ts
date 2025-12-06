'use server';

import { Task } from '../types';

export const getAccountTasks = async (id: string): Promise<Task[]> => {
  try {
    const res = await fetch(`${process.env.API_HOST}/account/tasks?id=${id}`, {
      next: { revalidate: 60 }, // 1分ごとに再検証
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error('Failed to fetch account tasks:', err);
    return [];
  }
};
