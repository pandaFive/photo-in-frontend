'use server';

import { serverHttpClient } from '@/src/infra/http';
import { AccountData } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

export const postSignup = async (
  name: string,
  password: string,
  area: string[],
  role: string,
  capacity: number,
): Promise<AccountData | Record<string, never>> => {
  const result = await serverHttpClient.post<AccountData>(
    '/accounts',
    {
      account: {
        name,
        password,
        area,
        role,
        capacity,
      },
    },
    { cache: 'no-store' },
  );

  if (result.ok) {
    return result.value;
  }
  logError('[postSignup]', result.error.message);
  return {};
};
