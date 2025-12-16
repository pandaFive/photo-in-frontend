'use server';

import { serverHttpClient } from '@/src/infra/http';
import { Task } from '@/src/types';

export const getAccountTasks = async (id: string): Promise<Task[]> => {
  const result = await serverHttpClient.get<Task[]>(`/account/tasks?id=${id}`, {
    cache: 'no-store',
  });

  if (result.ok) {
    return result.value;
  }
  console.error('Failed to fetch account tasks:', result.error.message);
  return [];
};
