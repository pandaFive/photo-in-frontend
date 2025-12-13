export const SWR_KEYS = {
  memberTasks: (accountId: string) => `/api/account/${accountId}/tasks`,
  allTasks: '/api/tasks/all?type=all',
  ngTasks: '/api/tasks/ng',
} as const;
