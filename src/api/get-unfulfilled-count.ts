'use server';

import { serverHttpClient } from '@/src/infra/http';
import { ApiResult, ErrorResponse } from '@/src/types';
import { getCookies } from '@/src/util/cookies';
import { logError } from '@/src/util/safe-logger';

export async function getUnfulfilledCount(): Promise<ApiResult<number>> {
  const token = getCookies('token');
  const result = await serverHttpClient.get<number>('/unfulfilled-count', {
    revalidate: 60, // 1分ごとに再検証
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.ok) {
    return result.value;
  }

  logError('[getUnfulfilledCount]', result.error.message);
  const errorResponse: ErrorResponse = {
    errors: [result.error.message],
  };
  return errorResponse;
}
