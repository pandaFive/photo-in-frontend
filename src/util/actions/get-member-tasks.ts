import { Task } from '@/src/types';

export const getMemberAssignTask = async (
  id: string,
  signal?: AbortSignal,
): Promise<Task[]> => {
  try {
    const res = await fetch(`/api/account/${id}/tasks`, {
      method: 'GET',
      signal,
      next: { revalidate: 60 }, // 1分ごとに再検証
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error('Failed to fetch member tasks:', err);
    return [];
  }
};
