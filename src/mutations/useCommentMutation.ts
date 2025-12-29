import { useCallback } from 'react';

import { httpClient } from '@/src/infra/http';
import {
  Comment,
  CommentApiResponse,
  MutationErrorType,
  MutationResult,
} from '@/src/types';
import { logError } from '@/src/util/safe-logger';

/**
 * コメント操作用のmutation hook
 * POST/PUT/DELETE操作を提供
 * TYPE-006: エラー時にerrorType, statusCodeを保持
 */
export const useCommentMutation = () => {
  /**
   * 新しいコメントを作成
   * account_idはサーバー側で認証ユーザーから自動設定される
   */
  const createComment = useCallback(
    async (
      content: string,
      cycleId: number
    ): Promise<MutationResult<Comment>> => {
      const result = await httpClient.post<Comment>('/api/comment', {
        content,
        taskId: cycleId,
      });

      if (!result.ok) {
        logError('[createComment]', result.error);
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
    []
  );

  /**
   * 既存のコメントを更新
   */
  const updateComment = useCallback(
    async (content: string, id: number): Promise<MutationResult<Comment>> => {
      const result = await httpClient.put<Comment>('/api/comment', {
        content,
        id,
      });

      if (!result.ok) {
        logError('[updateComment]', result.error);
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
    []
  );

  /**
   * コメントを削除
   */
  const deleteComment = useCallback(
    async (id: number): Promise<MutationResult<CommentApiResponse>> => {
      const result = await httpClient.delete<CommentApiResponse>(
        `/api/comment?commentId=${id}`
      );

      if (!result.ok) {
        logError('[deleteComment]', result.error);
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
    []
  );

  return {
    createComment,
    updateComment,
    deleteComment,
  };
};
