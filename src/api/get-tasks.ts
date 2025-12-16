'use server';

import { serverHttpClient } from '@/src/infra/http';
import { Task } from '@/src/types';

export async function getTasks(): Promise<Task[]> {
  const result = await serverHttpClient.get<Task[]>('/tasks?type=all', {
    cache: 'no-store',
  });

  if (result.ok) {
    return result.value;
  }
  return [];
}
