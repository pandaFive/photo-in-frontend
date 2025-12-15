import { DomainError, toDisplayError } from '@/src/domain/types/error';
import { httpClient } from '@/src/infra/http';
import { Task } from '@/src/types';

/**
 * SWR用カスタムエラークラス
 * SWRはErrorインスタンスを期待するため、DomainErrorをラップ
 */
export class TaskFetchError extends Error {
  public readonly domainError: DomainError;

  constructor(domainError: DomainError) {
    super(toDisplayError(domainError));
    this.name = 'TaskFetchError';
    this.domainError = domainError;
  }
}

/**
 * タスク一覧取得用fetcher
 * SWRで使用するためError throwパターン
 */
export const taskListFetcher = async (url: string): Promise<Task[]> => {
  const result = await httpClient.get<Task[]>(url);

  if (!result.ok) {
    throw new TaskFetchError(result.error);
  }

  return result.value;
};

/**
 * エラーがTaskFetchErrorかどうかを判定
 */
export const isTaskFetchError = (error: unknown): error is TaskFetchError => {
  return error instanceof TaskFetchError;
};
