'use server';

import { serverHttpClient } from '@/src/infra/http';
import { ApiResult, ErrorResponse } from '@/src/types';

export async function getUnfulfilledCount(): Promise<ApiResult<number>> {
  const result = await serverHttpClient.get<number>('/unfulfilled-count', {
    revalidate: 60, // 1分ごとに再検証
  });

  if (result.ok) {
    return result.value;
  }

  const errorResponse: ErrorResponse = {
    message: result.error.message,
  };
  return errorResponse;
}
