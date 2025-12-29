import { useCallback } from 'react';

import { httpClient } from '@/src/infra/http';
import { MutationResult } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

/**
 * アカウント操作用のmutation hook
 */
export const useAccountMutation = () => {
  /**
   * アカウントを削除
   */
  const deleteAccount = useCallback(
    async (accountId: number): Promise<MutationResult> => {
      const result = await httpClient.delete(`/api/account/${accountId}`);

      if (!result.ok) {
        logError('[deleteAccount]', result.error.message);
        return { success: false, error: result.error.message };
      }

      return { success: true, data: undefined };
    },
    []
  );

  return {
    deleteAccount,
  };
};
