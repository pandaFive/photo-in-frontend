'use server';

import { ErrorResponse, MemberStatus, ApiResult } from '@/src/types';

export async function getAccountStatus(): Promise<ApiResult<MemberStatus[]>> {
  const res = await fetch(`${process.env.API_HOST}/accounts`, {
    next: { revalidate: 300 }, // 5分ごとに再検証
  });

  if (res.ok) {
    const result = (await res.json()) as unknown;
    return result as MemberStatus[];
  } else {
    const errors = (await res.json()) as unknown;
    return errors as ErrorResponse;
  }
}
