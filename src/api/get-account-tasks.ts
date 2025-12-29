'use server';

import { serverHttpClient } from '@/src/infra/http';
import { ErrorResponse, Task } from '@/src/types';
import { getCookies } from '@/src/util/cookies';
import { logError } from '@/src/util/safe-logger';

export const getAccountTasks = async (
  id: string,
): Promise<Task[] | ErrorResponse> => {
  const token = getCookies('token');
  const result = await serverHttpClient.get<Task[]>(`/account/tasks?id=${id}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.ok) {
    return result.value;
  }
  logError('[getAccountTasks]', result.error);
  return { errors: [result.error.message] };
};
