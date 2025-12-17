import { useCallback, useRef, useState } from 'react';

import { httpClient } from '@/src/infra/http';
import { Comment } from '@/src/types';

type TaskDetailData = {
  fileUrl: string;
  comments: Comment[];
};

type TaskDetailState = {
  data: TaskDetailData | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
};

// モジュールレベルのキャッシュ（コンポーネントのアンマウントに影響されない）
// キーは文字列に統一（型の不一致を防ぐ）
const taskDetailCache = new Map<string, TaskDetailData>();
const fetchingTasks = new Set<string>();

/** キャッシュにデータが存在するかチェック */
export const isTaskDetailCached = (taskId: number): boolean => {
  return taskDetailCache.has(String(taskId));
};

/**
 * タスク詳細データ（ファイルURL・コメント）の遅延読み込み用hook
 * アコーディオン展開時に手動でfetchをトリガー
 */
export const useTaskDetail = (taskId: number, taskTitle: string, accountId: number) => {
  const cacheKey = String(taskId);

  // キャッシュからの初期値を設定
  const cachedData = taskDetailCache.get(cacheKey);
  const [state, setState] = useState<TaskDetailState>({
    data: cachedData ?? null,
    isLoading: false,
    isLoaded: !!cachedData,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * データを取得（手動トリガー）
   */
  const fetchData = useCallback(async () => {
    // 既にキャッシュ済みまたはフェッチ中の場合はスキップ
    if (taskDetailCache.has(cacheKey) || fetchingTasks.has(cacheKey)) {
      return;
    }
    fetchingTasks.add(cacheKey);

    // 既存のリクエストがある場合はキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // ファイルURLとコメントを並列で取得
      const [fileResult, commentsResult] = await Promise.all([
        httpClient.get<string>(`/api/aws?key=${taskTitle}`, { signal }),
        httpClient.get<Comment[]>(
          `/api/comments?taskId=${String(taskId)}&accountId=${String(accountId)}`,
          { signal }
        ),
      ]);

      if (!fileResult.ok) {
        throw new Error(fileResult.error.message);
      }
      if (!commentsResult.ok) {
        throw new Error(commentsResult.error.message);
      }

      const data = {
        fileUrl: fileResult.value,
        comments: commentsResult.value,
      };

      // キャッシュに保存
      taskDetailCache.set(cacheKey, data);
      fetchingTasks.delete(cacheKey);

      setState({
        data,
        isLoading: false,
        isLoaded: true,
        error: null,
      });
    } catch (err: unknown) {
      fetchingTasks.delete(cacheKey);

      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to fetch task data';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      console.error('Failed to fetch task data:', err);
    }
  }, [cacheKey, taskId, taskTitle, accountId]);

  /**
   * クリーンアップ（コンポーネントアンマウント時に呼び出し）
   */
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    fileUrl: state.data?.fileUrl ?? '',
    comments: state.data?.comments ?? [],
    isLoading: state.isLoading,
    isLoaded: state.isLoaded,
    error: state.error,
    fetchData,
    cleanup,
  };
};
