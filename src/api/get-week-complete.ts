'use server';

import { serverHttpClient } from '@/src/infra/http';
import { WeekCompleteData, ApiResult, ErrorResponse } from '@/src/types';
import { getCookies } from '@/src/util/cookies';

export async function getWeekComplete(): Promise<ApiResult<WeekCompleteData>> {
  const token = getCookies('token');
  const result = await serverHttpClient.get<WeekCompleteData>('/completed-data', {
    revalidate: 300, // 5分ごとに再検証
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.ok) {
    return result.value;
  }

  const errorResponse: ErrorResponse = {
    errors: [result.error.message],
  };
  return errorResponse;
}
