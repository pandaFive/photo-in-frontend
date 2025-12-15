import { useCallback } from 'react';

import { httpClient } from '@/src/infra/http';

type MutationResult = {
  success: boolean;
  error?: string;
};

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
        console.error('Failed to delete account:', result.error.message);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    },
    []
  );

  return {
    deleteAccount,
  };
};
