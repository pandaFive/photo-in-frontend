'use server';

import { serverHttpClient } from '@/src/infra/http';
import { WeekCompleteData, ApiResult, ErrorResponse } from '@/src/types';

export async function getWeekComplete(): Promise<ApiResult<WeekCompleteData>> {
  const result = await serverHttpClient.get<WeekCompleteData>('/completed-data', {
    revalidate: 300, // 5分ごとに再検証
  });

  if (result.ok) {
    return result.value;
  }

  const errorResponse: ErrorResponse = {
    message: result.error.message,
  };
  return errorResponse;
}
