'use server';

import { serverHttpClient } from '@/src/infra/http';
import { ErrorResponse, Task } from '@/src/types';
import { getCookies } from '@/src/util/cookies';
import { logError } from '@/src/util/safe-logger';

const postTaskCreate = async (
  name: string,
): Promise<Task | ErrorResponse> => {
  const token = getCookies('token');
  const result = await serverHttpClient.post<Task>(
    '/tasks',
    { task: { task_title: name } },
    {
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (result.ok) {
    return result.value;
  }
  logError('[postTaskCreate]', result.error);
  return { errors: [result.error.message] };
};

export default postTaskCreate;
