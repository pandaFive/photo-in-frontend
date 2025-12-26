'use server';

import { serverHttpClient } from '@/src/infra/http';
import { getCookies } from '@/src/util/cookies';

type TaskResponse = {
  [key: string]: string;
};

const postTaskCreate = async (
  name: string,
): Promise<TaskResponse | Record<string, never>> => {
  const token = getCookies('token');
  const result = await serverHttpClient.post<TaskResponse>(
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
  console.error('Task creation failed:', result.error.message);
  return {};
};

export default postTaskCreate;
