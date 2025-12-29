'use server';

import { serverHttpClient } from '@/src/infra/http';
import { Area, ErrorResponse } from '@/src/types';
import { getCookies } from '@/src/util/cookies';
import { logError } from '@/src/util/safe-logger';

export const getAreas = async (): Promise<Area[] | ErrorResponse> => {
  const token = getCookies('token');
  const result = await serverHttpClient.get<Area[]>('/areas', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.ok) {
    return result.value;
  }
  logError('[getAreas]', result.error);
  return { errors: [result.error.message] };
};
