'use server';

import { serverHttpClient } from '@/src/infra/http';

export interface Account {
  id: string;
  role: string;
  token: string;
  name: string;
}

export async function postLogin(
  name: string,
  password: string,
): Promise<Account | Record<string, never>> {
  const result = await serverHttpClient.post<Account>(
    '/account/login',
    { account: { name, password } },
    { cache: 'no-store' },
  );

  if (result.ok) {
    return result.value;
  }
  console.error('Login failed:', result.error.message);
  return {};
}
