import { useCallback } from 'react';

import { httpClient } from '@/src/infra/http';
import { MemberStatus, MutationErrorType, MutationResult } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

/**
 * アカウント操作用のmutation hook
 */
export const useAccountMutation = () => {
  /**
   * アカウント情報を更新
   * TYPE-006: エラー時にerrorType, statusCodeを保持
   */
  const updateAccount = useCallback(
    async (
      id: number,
      name: string,
      areaIds: number[],
      capacity: number,
    ): Promise<MutationResult<MemberStatus>> => {
      const result = await httpClient.put<MemberStatus>('/api/account', {
        id,
        name,
        area: areaIds,
        capacity,
      });

      if (!result.ok) {
        logError('[updateAccount]', result.error);
        return {
          success: false,
          error: result.error.message,
          errorType: result.error.type as MutationErrorType,
          statusCode:
            result.error.type === 'api' ? result.error.status : undefined,
        };
      }

      return { success: true, data: result.value };
    },
    [],
  );

  /**
   * アカウントを削除
   * TYPE-006: エラー時にerrorType, statusCodeを保持
   */
  const deleteAccount = useCallback(
    async (accountId: number): Promise<MutationResult> => {
      const result = await httpClient.delete(`/api/account/${accountId}`);

      if (!result.ok) {
        logError('[deleteAccount]', result.error);
        return {
          success: false,
          error: result.error.message,
          errorType: result.error.type as MutationErrorType,
          statusCode:
            result.error.type === 'api' ? result.error.status : undefined,
        };
      }

      return { success: true, data: undefined };
    },
    []
  );

  return {
    updateAccount,
    deleteAccount,
  };
};
