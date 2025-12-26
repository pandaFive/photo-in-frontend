'use server';

import { serverHttpClient } from '@/src/infra/http';
import { Task } from '@/src/types';
import { getCookies } from '@/src/util/cookies';

export const getAccountTasks = async (id: string): Promise<Task[]> => {
  const token = getCookies('token');
  const result = await serverHttpClient.get<Task[]>(`/account/tasks?id=${id}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.ok) {
    return result.value;
  }
  console.error('Failed to fetch account tasks:', result.error.message);
  return [];
};
