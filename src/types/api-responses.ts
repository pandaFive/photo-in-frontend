/**
 * バックエンドAPIレスポンス型定義（snake_case）
 *
 * バックエンドのRails APIはsnake_case形式でレスポンスを返却する。
 * フロントエンドではcamelCase形式を使用するため、
 * Route Handler層で変換を行う。
 *
 * @see photo-in-backend/app/presenters/comment_presenter.rb
 */

/**
 * バックエンドAPIからのコメントレスポンス型（snake_case）
 *
 * @example
 * {
 *   id: 1,
 *   content: "コメント内容",
 *   task_id: 10,
 *   account_id: 5,
 *   account_name: "山田太郎",
 *   account_role: "member",
 *   updated_at: "2025-12-31T12:00:00.000Z"
 * }
 */
export type CommentApiResponse = {
  id: number;
  content: string;
  task_id: number;
  account_id: number;
  account_name: string | null;
  account_role: string | null;
  updated_at: string;
};
