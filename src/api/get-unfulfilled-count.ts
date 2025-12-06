'use server';

import { ApiResult } from '@/src/types';

export async function getUnfulfilledCount(): Promise<ApiResult<number>> {
  const res = await fetch(`${process.env.API_HOST}/unfulfilled-count`, {
    next: { revalidate: 60 }, // 1分ごとに再検証
  });

  if (res.ok) {
    const unfulfilledCount: number = (await res.json()) as number;
    return unfulfilledCount;
  } else {
    const errors = (await res.json()) as ApiResult<number>;
    return errors;
  }
}
