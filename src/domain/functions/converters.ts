/**
 * API レスポンス変換関数
 *
 * バックエンド（Rails）のsnake_caseレスポンスを
 * フロントエンド（TypeScript）のcamelCase型に変換する。
 *
 * domain層に配置し、純粋関数として実装（I/O禁止）
 */

import { Comment } from '@/src/types';
import { CommentApiResponse } from '@/src/types/api-responses';

/**
 * バックエンドAPIレスポンス（snake_case）をフロントエンド型（camelCase）に変換
 *
 * account_name/account_roleがnullの場合はデフォルト値を設定
 *
 * @param apiComment - バックエンドAPIからのコメントオブジェクト
 * @returns フロントエンド用のComment型オブジェクト
 *
 * @example
 * const apiComment = { id: 1, content: "test", task_id: 10, ... };
 * const comment = convertApiCommentToComment(apiComment);
 * // { id: 1, content: "test", taskId: 10, ... }
 */
export const convertApiCommentToComment = (
  apiComment: CommentApiResponse
): Comment => {
  // null安全なデフォルト値設定
  const accountName = apiComment.account_name ?? '不明なユーザー';
  const accountRole = apiComment.account_role ?? 'member';

  return {
    id: apiComment.id,
    name: accountName,
    content: apiComment.content,
    taskId: apiComment.task_id,
    updatedAt: apiComment.updated_at,
    accountName: accountName,
    role: accountRole,
  };
};

/**
 * バックエンドAPIレスポンス配列を変換
 *
 * @param apiComments - バックエンドAPIからのコメント配列
 * @returns フロントエンド用のComment配列
 */
export const convertApiCommentsToComments = (
  apiComments: CommentApiResponse[]
): Comment[] => {
  return apiComments.map(convertApiCommentToComment);
};
