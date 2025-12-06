import { Comment, CommentApiResponse } from '@/src/types';

/**
 * コメントAPI用の共通fetch関数
 * @param url - リクエストURL
 * @param options - fetchオプション
 * @param errorMessage - エラー時のログメッセージ
 * @returns レスポンスデータ、エラー時はnull
 */
const fetchCommentApi = async <T>(
  url: string,
  options: RequestInit,
  errorMessage: string,
): Promise<T | null> => {
  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(errorMessage, err);
    return null;
  }
};

/**
 * 新しいコメントを投稿する
 * @param content - コメント内容
 * @param accountId - アカウントID
 * @param taskId - タスクID
 * @returns 作成されたコメント、エラー時はnull
 */
export const fetchPostComment = async (
  content: string,
  accountId: number,
  taskId: number,
): Promise<Comment | null> => {
  return fetchCommentApi<Comment>(
    '/api/comment',
    {
      method: 'POST',
      body: JSON.stringify({ content, accountId, taskId }),
    },
    'Failed to post comment:',
  );
};

/**
 * 既存のコメントを更新する
 * @param content - 更新後のコメント内容
 * @param id - コメントID
 * @returns 更新されたコメント、エラー時はnull
 */
export const fetchPutComment = async (
  content: string,
  id: number,
): Promise<Comment | null> => {
  return fetchCommentApi<Comment>(
    '/api/comment',
    {
      method: 'PUT',
      body: JSON.stringify({ content, id }),
    },
    'Failed to update comment:',
  );
};

/**
 * コメントを削除する
 * @param id - コメントID
 * @returns 削除結果、エラー時はnull
 */
export const fetchDeleteComment = async (id: number): Promise<CommentApiResponse | null> => {
  return fetchCommentApi<CommentApiResponse>(
    `/api/comment?commentId=${id}`,
    {
      method: 'DELETE',
    },
    'Failed to delete comment:',
  );
};
