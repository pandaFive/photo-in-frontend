import { Task } from '@/src/types';

export const getAllTasks = async (signal?: AbortSignal): Promise<Task[]> => {
  try {
    const res = await fetch(`/api/tasks/all?type=all`, {
      method: 'GET',
      signal,
      next: { revalidate: 60 }, // 1分ごとに再検証
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error('Failed to fetch all tasks:', err);
    return [];
  }
};

export const getNGTasks = async (signal?: AbortSignal): Promise<Task[]> => {
  try {
    const res = await fetch(`/api/tasks/ng`, {
      method: 'GET',
      signal,
      next: { revalidate: 60 }, // 1分ごとに再検証
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error('Failed to fetch NG tasks:', err);
    return [];
  }
};
