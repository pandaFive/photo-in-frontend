'use server';

import { serverHttpClient } from '@/src/infra/http';
import { ErrorResponse, Task } from '@/src/types';
import { getCookies } from '@/src/util/cookies';

export async function getTasks(): Promise<Task[] | ErrorResponse> {
  const token = getCookies('token');
  const result = await serverHttpClient.get<Task[]>('/tasks?type=all', {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.ok) {
    return result.value;
  }
  console.error('Failed to fetch tasks:', result.error.message);
  return { errors: [result.error.message] };
}
