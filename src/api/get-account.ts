import { getCookies } from '../util/cookies';

export async function getAccount() {
  const token = getCookies('token');
  const res = await fetch(`${process.env.API_HOST}/account`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return null;
  } else {
    const currentAccount = await res.json();
    return currentAccount.account;
  }
}
