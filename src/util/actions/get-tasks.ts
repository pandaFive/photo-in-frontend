import { Task } from '@/src/types';

export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const res = await fetch(`/api/tasks/all?type=all`, {
      method: 'GET',
      cache: 'no-store',
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error('Failed to fetch all tasks:', err);
    return [];
  }
};

export const getNGTasks = async (): Promise<Task[]> => {
  try {
    const res = await fetch(`/api/tasks/ng`, {
      method: 'GET',
      cache: 'no-store',
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error('Failed to fetch NG tasks:', err);
    return [];
  }
};
