'use server';

import { WeekCompleteData, ApiResult } from '@/src/types';

export async function getWeekComplete(): Promise<ApiResult<WeekCompleteData>> {
  const res = await fetch(`${process.env.API_HOST}/completed-data`, {
    next: { revalidate: 300 }, // 5分ごとに再検証
  });

  if (res.ok) {
    const result: WeekCompleteData = (await res.json()) as WeekCompleteData;
    return result;
  } else {
    const errors = (await res.json()) as ApiResult<WeekCompleteData>;
    return errors;
  }
}
