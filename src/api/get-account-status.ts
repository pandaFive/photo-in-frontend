'use server';

import { MemberStatus } from '../types';

export interface ErrorResponse {
  message: string;
}

export async function getAccountStatus(): Promise<
  MemberStatus[] | ErrorResponse
> {
  const res = await fetch(`${process.env.API_HOST}/accounts`, {
    cache: 'no-store',
  });

  if (res.ok) {
    const result: MemberStatus[] = (await res.json()) as MemberStatus[];
    return result;
  } else {
    const errors: ErrorResponse = (await res.json()) as ErrorResponse;
    return errors;
  }
}
