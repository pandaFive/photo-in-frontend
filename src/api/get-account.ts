'use server';

import { serverHttpClient } from '@/src/infra/http';
import { AccountData } from '@/src/types';
import { getCookies } from '@/src/util/cookies';

type AccountResponse = {
  account: AccountData;
};

export const getAccount = async (): Promise<AccountData | null> => {
  const token = getCookies('token');
  const result = await serverHttpClient.get<AccountResponse>('/account', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.ok) {
    return result.value.account;
  }
  return null;
};
