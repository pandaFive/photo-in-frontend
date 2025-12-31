import { useCallback } from 'react';

import { httpClient } from '@/src/infra/http';
import { Area, MutationErrorType, MutationResult } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

/** 削除レスポンス型 */
type DeleteResponse = { message: string };

/**
 * エリア操作用のmutation hook
 * CRUD操作（作成・更新・削除）を提供
 * TYPE-006: エラー時にerrorType, statusCodeを保持
 */
export const useAreaMutation = () => {
  /**
   * 新しいエリアを作成
   */
  const createArea = useCallback(
    async (name: string): Promise<MutationResult<Area>> => {
      const result = await httpClient.post<Area>('/api/area', { name });

      if (!result.ok) {
        logError('[createArea]', result.error);
        return {
          success: false,
          error: result.error.message,
          errorType: result.error.type as MutationErrorType,
          statusCode: result.error.type === 'api' ? result.error.status : undefined,
        };
      }

      return { success: true, data: result.value };
    },
    [],
  );

  /**
   * 既存のエリアを更新
   */
  const updateArea = useCallback(
    async (id: number, name: string): Promise<MutationResult<Area>> => {
      const result = await httpClient.put<Area>('/api/area', { id, name });

      if (!result.ok) {
        logError('[updateArea]', result.error);
        return {
          success: false,
          error: result.error.message,
          errorType: result.error.type as MutationErrorType,
          statusCode: result.error.type === 'api' ? result.error.status : undefined,
        };
      }

      return { success: true, data: result.value };
    },
    [],
  );

  /**
   * エリアを削除
   */
  const deleteArea = useCallback(
    async (id: number): Promise<MutationResult<DeleteResponse>> => {
      const result = await httpClient.delete<DeleteResponse>(`/api/area/${id}`);

      if (!result.ok) {
        logError('[deleteArea]', result.error);
        return {
          success: false,
          error: result.error.message,
          errorType: result.error.type as MutationErrorType,
          statusCode: result.error.type === 'api' ? result.error.status : undefined,
        };
      }

      return { success: true, data: result.value };
    },
    [],
  );

  return {
    createArea,
    updateArea,
    deleteArea,
  };
};
