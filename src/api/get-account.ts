'use server';

import { serverHttpClient } from '@/src/infra/http';
import { AccountData } from '@/src/types';
import { getCookies } from '@/src/util/cookies';

// バックエンドが返す実際のレスポンス構造
type AccountApiResponse = {
  id: number;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  capacity: number;
};

export const getAccount = async (): Promise<AccountData | null> => {
  const token = getCookies('token');

  if (!token) {
    return null;
  }

  const result = await serverHttpClient.get<AccountApiResponse>('/account', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.ok) {
    return {
      id: result.value.id,
      name: result.value.name,
      role: result.value.role,
      area: [],
      token: token,
    };
  }
  return null;
};
