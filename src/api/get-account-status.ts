'use server';

import { serverHttpClient } from '@/src/infra/http';
import { MemberStatus, ApiResult, ErrorResponse } from '@/src/types';
import { getCookies } from '@/src/util/cookies';

export async function getAccountStatus(): Promise<ApiResult<MemberStatus[]>> {
  const token = getCookies('token');
  if (!token) {
    return null;
  }

  const result = await serverHttpClient.get<MemberStatus[]>('/accounts', {
    headers: { Authorization: `Bearer ${token}` },
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
