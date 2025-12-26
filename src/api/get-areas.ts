'use server';

import { serverHttpClient } from '@/src/infra/http';
import { Area } from '@/src/types';
import { getCookies } from '@/src/util/cookies';

export const getAreas = async (): Promise<Area[]> => {
  const token = getCookies('token');
  const result = await serverHttpClient.get<Area[]>('/areas', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (result.ok) {
    return result.value;
  }
  return [];
};
