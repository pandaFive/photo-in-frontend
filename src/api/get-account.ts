import { getCookies } from '../util/cookies';

type response = {
  account: AccountData;
};

export type AccountData = {
  id: number;
  name: string;
  area: string[];
  role: string;
  token: string;
};

export async function getAccount() {
  const token = getCookies('token');
  const res = await fetch(`${process.env.API_HOST}/account`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return null;
  } else {
    const currentAccount: response = (await res.json()) as response;
    return currentAccount.account;
  }
}
