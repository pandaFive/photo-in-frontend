import { useCallback, useRef } from 'react';
import { KeyedMutator } from 'swr';

import { DomainError, isDomainError } from '@/src/domain/types/error';
import { httpClient } from '@/src/infra/http';
import { MutationErrorType, MutationResult, Task } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

/**
 * DomainErrorからMutationResultを生成するヘルパー
 * TYPE-006: エラー情報を保持してMutationResult形式に変換
 */
const toMutationError = (
  context: string,
  error: DomainError,
  fallbackMessage: string
): MutationResult => {
  logError(context, error);
  return {
    success: false,
    error: error.message || fallbackMessage,
    errorType: error.type as MutationErrorType,
    statusCode: error.type === 'api' ? error.status : undefined,
  };
};

/**
 * 非DomainErrorをMutationResultに変換するヘルパー
 * TypeError: ネットワークエラー（fetch失敗）
 * その他: 予期しないエラー
 */
const toUnexpectedError = (
  context: string,
  error: unknown,
  fallbackMessage: string
): MutationResult => {
  logError(context, error);
  const isNetworkError = error instanceof TypeError;
  const message = error instanceof Error ? error.message : fallbackMessage;
  return {
    success: false,
    error: message,
    errorType: isNetworkError ? 'network' : undefined,
  };
};

/**
 * タスク更新用Mutation Hook
 *
 * 機能:
 * - 楽観的更新（Optimistic Update）
 * - 連打防止（同一タスクへの重複リクエスト防止）
 * - エラー時の自動ロールバック
 * - TYPE-006: エラー時にerrorType, statusCodeを保持
 */
export const useTaskMutation = (mutate: KeyedMutator<Task[]>) => {
  // 処理中のタスクIDを追跡（連打防止）
  const pendingTasksRef = useRef<Set<number>>(new Set());

  /**
   * タスクを完了状態にする
   */
  const completeTask = useCallback(
    async (taskId: number, historyId: string): Promise<MutationResult> => {
      // 連打防止: 既に処理中なら何もしない
      if (pendingTasksRef.current.has(taskId)) {
        return { success: false, error: '処理中です', errorType: 'validation' };
      }
      pendingTasksRef.current.add(taskId);

      try {
        await mutate(
          async (currentData) => {
            const result = await httpClient.put(
              `/api/task/${historyId}/complete`,
            );
            if (!result.ok) {
              // DomainErrorをそのままthrowしてcatchで処理
              throw result.error;
            }
            return currentData?.filter((t) => t.id !== taskId);
          },
          {
            optimisticData: (currentData) =>
              currentData?.filter((t) => t.id !== taskId),
            rollbackOnError: true,
            revalidate: false,
          },
        );
        return { success: true, data: undefined };
      } catch (e) {
        if (isDomainError(e)) {
          return toMutationError('[completeTask]', e, '完了処理に失敗しました');
        }
        return toUnexpectedError('[completeTask]', e, '完了処理に失敗しました');
      } finally {
        pendingTasksRef.current.delete(taskId);
      }
    },
    [mutate],
  );

  /**
   * タスクをNG状態にする
   */
  const markAsNG = useCallback(
    async (taskId: number, historyId: string): Promise<MutationResult> => {
      if (pendingTasksRef.current.has(taskId)) {
        return { success: false, error: '処理中です', errorType: 'validation' };
      }
      pendingTasksRef.current.add(taskId);

      try {
        await mutate(
          async (currentData) => {
            const result = await httpClient.put(`/api/task/${historyId}/ng`);
            if (!result.ok) {
              throw result.error;
            }
            return currentData?.filter((t) => t.id !== taskId);
          },
          {
            optimisticData: (currentData) =>
              currentData?.filter((t) => t.id !== taskId),
            rollbackOnError: true,
            revalidate: false,
          },
        );
        return { success: true, data: undefined };
      } catch (e) {
        if (isDomainError(e)) {
          return toMutationError('[markAsNG]', e, 'NG処理に失敗しました');
        }
        return toUnexpectedError('[markAsNG]', e, 'NG処理に失敗しました');
      } finally {
        pendingTasksRef.current.delete(taskId);
      }
    },
    [mutate],
  );

  /**
   * タスクを再アサインする
   */
  const reassign = useCallback(
    async (taskId: number, taskIdStr: string): Promise<MutationResult> => {
      if (pendingTasksRef.current.has(taskId)) {
        return { success: false, error: '処理中です', errorType: 'validation' };
      }
      pendingTasksRef.current.add(taskId);

      try {
        await mutate(
          async (currentData) => {
            const result = await httpClient.put(
              `/api/task/${taskIdStr}/reassign`,
            );
            if (!result.ok) {
              throw result.error;
            }
            return currentData?.filter((t) => t.id !== taskId);
          },
          {
            optimisticData: (currentData) =>
              currentData?.filter((t) => t.id !== taskId),
            rollbackOnError: true,
            revalidate: false,
          },
        );
        return { success: true, data: undefined };
      } catch (e) {
        if (isDomainError(e)) {
          return toMutationError('[reassign]', e, '再アサイン処理に失敗しました');
        }
        return toUnexpectedError('[reassign]', e, '再アサイン処理に失敗しました');
      } finally {
        pendingTasksRef.current.delete(taskId);
      }
    },
    [mutate],
  );

  /**
   * タスクが処理中かどうかを確認
   */
  const isPending = useCallback((taskId: number): boolean => {
    return pendingTasksRef.current.has(taskId);
  }, []);

  return {
    completeTask,
    markAsNG,
    reassign,
    isPending,
  };
};
