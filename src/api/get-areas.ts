'use server';

import { serverHttpClient } from '@/src/infra/http';
import { Area } from '@/src/types';

export const getAreas = async (): Promise<Area[]> => {
  const result = await serverHttpClient.get<Area[]>('/areas');

  if (result.ok) {
    return result.value;
  }
  return [];
};
