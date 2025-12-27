'use server';

import { serverHttpClient } from '@/src/infra/http';
import { AccountData, ErrorResponse } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

// ERR-004: エラー時にErrorResponseを返すように変更
export const postSignup = async (
  name: string,
  password: string,
  area: string[],
  role: string,
  capacity: number,
): Promise<AccountData | ErrorResponse> => {
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
  return { errors: [result.error.message] };
};
