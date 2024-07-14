'use server';

import { AccountData } from '../types';
import { getCookies } from '../util/cookies';

type response = {
  account: AccountData;
};

export const getAccount = async () => {
  const token = getCookies('token');
  const res = await fetch(`${process.env.API_HOST}/account`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return null;
  } else {
    const currentAccount: response = (await res.json()) as response;
    return currentAccount.account;
  }
};
