'use server';

import { MemberStatus } from '../types';

export interface ErrorResponse {
  message: string;
}

export async function getAccountStatus(): Promise<
  MemberStatus[] | ErrorResponse
> {
  const res = await fetch(`${process.env.API_HOST}/accounts`, {
    next: { revalidate: 300 }, // 5分ごとに再検証
  });

  if (res.ok) {
    const result: MemberStatus[] = (await res.json()) as MemberStatus[];
    return result;
  } else {
    const errors: ErrorResponse = (await res.json()) as ErrorResponse;
    return errors;
  }
}
