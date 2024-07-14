import { Task } from '@/src/types';

export const getMemberAssignTask = async (id: string) => {
  try {
    const res = await fetch(`/api/account/${id}/tasks`, {
      method: 'GET',
      cache: 'no-store',
    });
    const result: Task[] = (await res.json()) as Task[];
    return result;
  } catch (err) {
    console.error(err);
    return Array<Task>;
  }
};
