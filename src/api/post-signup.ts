'use server';

import { AccountData } from '../types';

export const postSignup = async (
  name: string,
  password: string,
  area: string[],
  role: string,
  capacity: number,
) => {
  try {
    const res = await fetch(`${process.env.API_HOST}/accounts`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: {
          name: name,
          password: password,
          area: area,
          role: role,
          capacity: capacity,
        },
      }),
    });
    const account: AccountData = (await res.json()) as AccountData;
    return account;
  } catch (err) {
    console.error(err);
    return {};
  }
};
