'use server';

import { serverHttpClient } from '@/src/infra/http';
import { logError } from '@/src/util/safe-logger';

export interface Account {
  id: string;
  role: string;
  token: string;
  name: string;
}

type LoginResponse = {
  account: Account;
};

export async function postLogin(
  name: string,
  password: string,
): Promise<Account | Record<string, never>> {
  const result = await serverHttpClient.post<LoginResponse>(
    '/account/login',
    { account: { name, password } },
    { cache: 'no-store' },
  );

  if (result.ok) {
    return result.value.account;
  }
  logError('[postLogin]', result.error.message);
  return {};
}
