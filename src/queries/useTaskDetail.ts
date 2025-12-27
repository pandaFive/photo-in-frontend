import useSWR from 'swr';

import { httpClient } from '@/src/infra/http';
import { Comment } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

type TaskDetailData = {
  fileUrl: string;
  comments: Comment[];
};

// エラー型（SWRに渡すため）
type TaskDetailError = {
  message: string;
};

// SWRキーの型定義（配列形式で特殊文字問題を回避）
type TaskDetailKey = readonly ['taskDetail', number, string, number];

/**
 * タスク詳細データ取得用fetcher
 * ファイルURLとコメントを並列で取得
 */
const taskDetailFetcher = async (
  key: TaskDetailKey
): Promise<TaskDetailData> => {
  // 配列キーから直接パラメータを取得（コロン区切りの問題を回避）
  const [, taskId, taskTitle, accountId] = key;

  const [fileResult, commentsResult] = await Promise.all([
    httpClient.get<string>(`/api/aws?key=${encodeURIComponent(taskTitle)}`),
    httpClient.get<Comment[]>(
      `/api/comments?taskId=${String(taskId)}&accountId=${String(accountId)}`
    ),
  ]);

  if (!fileResult.ok) {
    const error: TaskDetailError = { message: fileResult.error.message };
    throw error;
  }
  if (!commentsResult.ok) {
    const error: TaskDetailError = { message: commentsResult.error.message };
    throw error;
  }

  return {
    fileUrl: fileResult.value,
    comments: commentsResult.value,
  };
};

type UseTaskDetailReturn = {
  fileUrl: string;
  comments: Comment[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  mutate: ReturnType<typeof useSWR<TaskDetailData, TaskDetailError>>['mutate'];
};

/**
 * タスク詳細データ（ファイルURL・コメント）のSWR Query Hook
 *
 * PERF-001: 手動Mapキャッシュ → SWRに置き換え
 * - メモリリークリスク解消（SWRが自動的にキャッシュを管理）
 * - 重複リクエスト防止（SWRのdedupingInterval）
 * - 再検証機能（必要に応じてmutate()で再取得）
 *
 * @param taskId - タスクID
 * @param taskTitle - タスクタイトル（S3キー用）
 * @param accountId - アカウントID（コメント取得用）
 * @param shouldFetch - trueの場合のみデータを取得（アコーディオン展開時など）
 */
export const useTaskDetail = (
  taskId: number,
  taskTitle: string,
  accountId: number,
  shouldFetch: boolean
): UseTaskDetailReturn => {
  // SWRの条件付きフェッチ: shouldFetchがfalseの場合はnullを渡して取得をスキップ
  // 配列キーを使用してtaskTitleに特殊文字（コロン等）が含まれる場合も正しく動作
  const swrKey: TaskDetailKey | null = shouldFetch
    ? ['taskDetail', taskId, taskTitle, accountId] as const
    : null;

  const { data, error, isLoading, mutate } = useSWR<
    TaskDetailData,
    TaskDetailError
  >(swrKey, taskDetailFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1分間の重複リクエスト防止
    onError: (err, key) => {
      // エラーログにコンテキストを追加
      const [, taskId, taskTitle, accountId] = key as TaskDetailKey;
      logError('[useTaskDetail]', {
        error: err,
        taskId,
        taskTitle,
        accountId,
      });
    },
  });

  return {
    fileUrl: data?.fileUrl ?? '',
    comments: data?.comments ?? [],
    isLoading,
    isLoaded: !!data,
    error: error?.message ?? null,
    mutate,
  };
};
