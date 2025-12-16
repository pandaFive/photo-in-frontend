'use server';

import { serverHttpClient } from '@/src/infra/http';

type TaskResponse = {
  [key: string]: string;
};

const postTaskCreate = async (
  name: string,
): Promise<TaskResponse | Record<string, never>> => {
  const result = await serverHttpClient.post<TaskResponse>(
    '/tasks',
    { task: { task_title: name } },
    { cache: 'no-store' },
  );

  if (result.ok) {
    return result.value;
  }
  console.error('Task creation failed:', result.error.message);
  return {};
};

export default postTaskCreate;
