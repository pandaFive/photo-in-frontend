'use server';

import { serverHttpClient } from '@/src/infra/http';
import { MemberStatus, ApiResult, ErrorResponse } from '@/src/types';

export async function getAccountStatus(): Promise<ApiResult<MemberStatus[]>> {
  const result = await serverHttpClient.get<MemberStatus[]>('/accounts', {
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
