'use server';

export interface Account {
  id: string;
  role: string;
  token: string;
  name: string;
}

export async function postLogin(name: string, password: string) {
  try {
    const res = await fetch(`${process.env.API_HOST}/account/login`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: { name: name, password: password },
      }),
    });
    const account: Account = (await res.json()) as Account;
    return account;
  } catch (err) {
    console.error(err);
    return {};
  }
}
