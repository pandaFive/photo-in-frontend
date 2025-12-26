import { useCallback } from 'react';

import { httpClient } from '@/src/infra/http';
import { Comment, CommentApiResponse } from '@/src/types';

type MutationResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * コメント操作用のmutation hook
 * POST/PUT/DELETE操作を提供
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
        console.error('Failed to create comment:', result.error.message);
        return { success: false, error: result.error.message };
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
        console.error('Failed to update comment:', result.error.message);
        return { success: false, error: result.error.message };
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
        console.error('Failed to delete comment:', result.error.message);
        return { success: false, error: result.error.message };
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
