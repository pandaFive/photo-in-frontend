import { Result, DomainError } from '@/src/domain/types/error';
import { httpClient } from '@/src/infra/http';
import { Task } from '@/src/types';

import {
  TaskFetchError,
  taskListFetcher,
  isTaskFetchError,
} from '@/src/api/tasks/fetchers';

// モック設定
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

const mockGet = httpClient.get as jest.MockedFunction<typeof httpClient.get>;

describe('fetchers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TaskFetchError', () => {
    test('DomainErrorをラップしてErrorインスタンスを生成する', () => {
      const domainError: DomainError = {
        type: 'api',
        status: 404,
        message: 'Not Found',
      };

      const error = new TaskFetchError(domainError);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TaskFetchError);
    });

    test('nameプロパティが"TaskFetchError"になる', () => {
      const domainError: DomainError = {
        type: 'api',
        status: 500,
        message: 'Server Error',
      };

      const error = new TaskFetchError(domainError);

      expect(error.name).toBe('TaskFetchError');
    });

    test('messageがtoDisplayErrorで変換される（APIエラー）', () => {
      const domainError: DomainError = {
        type: 'api',
        status: 404,
        message: 'タスクが見つかりません',
      };

      const error = new TaskFetchError(domainError);

      expect(error.message).toBe('エラー (404): タスクが見つかりません');
    });

    test('messageがtoDisplayErrorで変換される（ネットワークエラー）', () => {
      const domainError: DomainError = {
        type: 'network',
        message: '接続に失敗しました',
      };

      const error = new TaskFetchError(domainError);

      expect(error.message).toBe('ネットワークエラー: 接続に失敗しました');
    });

    test('domainErrorプロパティで元のエラーにアクセスできる', () => {
      const domainError: DomainError = {
        type: 'api',
        status: 401,
        message: 'Unauthorized',
      };

      const error = new TaskFetchError(domainError);

      expect(error.domainError).toBe(domainError);
      expect(error.domainError.type).toBe('api');
      expect(error.domainError.status).toBe(401);
    });
  });

  describe('taskListFetcher', () => {
    test('成功時はTask配列を返す', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          task_title: 'タスク1',
          area_name: '東京',
          history_id: 10,
          assign_cycle_id: 1,
          created_at: '2024-01-15T00:00:00Z',
        },
        {
          id: 2,
          task_title: 'タスク2',
          area_name: '大阪',
          history_id: 20,
          assign_cycle_id: 1,
          created_at: '2024-01-16T00:00:00Z',
        },
      ];
      const mockResult: Result<Task[]> = {
        ok: true,
        value: mockTasks,
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await taskListFetcher('/api/tasks');

      expect(result).toEqual(mockTasks);
    });

    test('指定されたURLでAPIを呼び出す', async () => {
      const mockResult: Result<Task[]> = {
        ok: true,
        value: [],
      };
      mockGet.mockResolvedValue(mockResult);

      await taskListFetcher('/api/tasks/all');

      expect(mockGet).toHaveBeenCalledWith('/api/tasks/all');
    });

    test('空配列も正常に返す', async () => {
      const mockResult: Result<Task[]> = {
        ok: true,
        value: [],
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await taskListFetcher('/api/tasks');

      expect(result).toEqual([]);
    });

    test('APIエラー時はTaskFetchErrorをスローする', async () => {
      const mockResult: Result<Task[]> = {
        ok: false,
        error: {
          type: 'api',
          status: 500,
          message: 'Internal Server Error',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      await expect(taskListFetcher('/api/tasks')).rejects.toThrow(TaskFetchError);
    });

    test('401エラー時もTaskFetchErrorをスローする', async () => {
      const mockResult: Result<Task[]> = {
        ok: false,
        error: {
          type: 'api',
          status: 401,
          message: 'Unauthorized',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      await expect(taskListFetcher('/api/tasks')).rejects.toThrow(TaskFetchError);
    });

    test('ネットワークエラー時もTaskFetchErrorをスローする', async () => {
      const mockResult: Result<Task[]> = {
        ok: false,
        error: {
          type: 'network',
          message: 'Network error',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      await expect(taskListFetcher('/api/tasks')).rejects.toThrow(TaskFetchError);
    });

    test('スローされたエラーにDomainErrorが含まれる', async () => {
      const domainError: DomainError = {
        type: 'api',
        status: 404,
        message: 'Not Found',
      };
      const mockResult: Result<Task[]> = {
        ok: false,
        error: domainError,
      };
      mockGet.mockResolvedValue(mockResult);

      try {
        await taskListFetcher('/api/tasks');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TaskFetchError);
        expect((error as TaskFetchError).domainError).toEqual(domainError);
      }
    });

    test('複数のタスクを正しく取得できる', async () => {
      const mockTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        task_title: `タスク${i + 1}`,
        area_name: '東京',
        history_id: (i + 1) * 10,
        assign_cycle_id: 1,
        created_at: '2024-01-15T00:00:00Z',
      }));
      const mockResult: Result<Task[]> = {
        ok: true,
        value: mockTasks,
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await taskListFetcher('/api/tasks');

      expect(result).toHaveLength(100);
    });
  });

  describe('isTaskFetchError', () => {
    test('TaskFetchErrorインスタンスの場合trueを返す', () => {
      const domainError: DomainError = {
        type: 'api',
        status: 500,
        message: 'Error',
      };
      const error = new TaskFetchError(domainError);

      expect(isTaskFetchError(error)).toBe(true);
    });

    test('通常のErrorインスタンスの場合falseを返す', () => {
      const error = new Error('Some error');

      expect(isTaskFetchError(error)).toBe(false);
    });

    test('nullの場合falseを返す', () => {
      expect(isTaskFetchError(null)).toBe(false);
    });

    test('undefinedの場合falseを返す', () => {
      expect(isTaskFetchError(undefined)).toBe(false);
    });

    test('文字列の場合falseを返す', () => {
      expect(isTaskFetchError('error message')).toBe(false);
    });

    test('オブジェクトの場合falseを返す', () => {
      const obj = { message: 'error', name: 'TaskFetchError' };

      expect(isTaskFetchError(obj)).toBe(false);
    });

    test('TypeErrorインスタンスの場合falseを返す', () => {
      const error = new TypeError('type error');

      expect(isTaskFetchError(error)).toBe(false);
    });

    test('型ガードとして正しく動作する', () => {
      const domainError: DomainError = {
        type: 'api',
        status: 403,
        message: 'Forbidden',
      };
      const error: unknown = new TaskFetchError(domainError);

      if (isTaskFetchError(error)) {
        // 型ガードにより、ここではerrorはTaskFetchError型
        expect(error.domainError.status).toBe(403);
        expect(error.message).toBe('エラー (403): Forbidden');
      } else {
        fail('Expected isTaskFetchError to return true');
      }
    });
  });

  describe('エッジケース', () => {
    test('日本語のエラーメッセージも正しく処理される', async () => {
      const mockResult: Result<Task[]> = {
        ok: false,
        error: {
          type: 'api',
          status: 400,
          message: 'リクエストが不正です',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      try {
        await taskListFetcher('/api/tasks');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(TaskFetchError);
        expect((error as TaskFetchError).message).toBe('エラー (400): リクエストが不正です');
      }
    });

    test('特殊文字を含むURLでもAPIが呼ばれる', async () => {
      const mockResult: Result<Task[]> = {
        ok: true,
        value: [],
      };
      mockGet.mockResolvedValue(mockResult);

      await taskListFetcher('/api/tasks?status=active&area=東京');

      expect(mockGet).toHaveBeenCalledWith('/api/tasks?status=active&area=東京');
    });
  });
});
