/**
 * SWRキャッシュキー定数
 *
 * SWRはキーに基づいてキャッシュを管理するため、
 * アプリケーション全体で一貫したキーを使用することが重要。
 * キーの変更はキャッシュの無効化を引き起こすため注意。
 */
export const SWR_KEYS = {
  /**
   * 特定メンバーのタスク一覧
   * @param accountId - アカウントID
   * @returns /api/account/{accountId}/tasks
   * @usage メンバー詳細ページでのタスク表示
   */
  memberTasks: (accountId: string) => `/api/account/${accountId}/tasks`,

  /**
   * 全タスク一覧（type=all）
   * @usage 管理者ダッシュボードでの全タスク表示
   */
  allTasks: '/api/tasks/all?type=all',

  /**
   * NGタスク一覧
   * @usage NGタスク管理画面での表示
   */
  ngTasks: '/api/tasks/ng',
} as const;
