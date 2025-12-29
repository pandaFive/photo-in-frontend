'use server';

import { serverHttpClient } from '@/src/infra/http';
import { MemberStatus, ApiResult, ErrorResponse } from '@/src/types';
import { getCookies } from '@/src/util/cookies';
import { logError } from '@/src/util/safe-logger';

export async function getAccountStatus(): Promise<ApiResult<MemberStatus[]>> {
  const token = getCookies('token');
  if (!token) {
    logError('[getAccountStatus]', 'Token not found in cookies');
    return { errors: ['認証が必要です'] };
  }

  const result = await serverHttpClient.get<MemberStatus[]>('/accounts', {
    headers: { Authorization: `Bearer ${token}` },
    revalidate: 300, // 5分ごとに再検証
  });

  if (result.ok) {
    return result.value;
  }

  logError('[getAccountStatus]', result.error);
  const errorResponse: ErrorResponse = {
    errors: [result.error.message],
  };
  return errorResponse;
}
