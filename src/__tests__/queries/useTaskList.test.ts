import { renderHook, act } from '@testing-library/react';
import { useTaskList } from '@/src/queries/useTaskList';
import { taskListFetcher, TaskFetchError } from '@/src/api/tasks';
import { AccountData, Task } from '@/src/types';

// SWRのモック関数を外部で定義
const mockUseSWR = jest.fn();

// SWRをモック
jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseSWR(...args),
}));

// taskListFetcherをモック
jest.mock('@/src/api/tasks', () => ({
  taskListFetcher: jest.fn(),
  TaskFetchError: class TaskFetchError extends Error {
    domainError: { type: string; message: string };
    constructor(domainError: { type: string; message: string }) {
      super(domainError.message);
      this.name = 'TaskFetchError';
      this.domainError = domainError;
    }
  },
  isTaskFetchError: (error: unknown): boolean => {
    return error instanceof Error && error.name === 'TaskFetchError';
  },
}));

const mockMemberAccount: AccountData = {
  id: 1,
  name: 'Test Member',
  email: 'member@test.com',
  role: 'member',
};

const mockAdminAccount: AccountData = {
  id: 2,
  name: 'Test Admin',
  email: 'admin@test.com',
  role: 'admin',
};

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Task 1',
    areaId: 1,
    areaName: 'Area 1',
    historyId: 'h1',
    createdAt: '2024-01-01',
    limitDate: '2024-01-10',
    tags: [],
  },
  {
    id: 2,
    title: 'Task 2',
    areaId: 2,
    areaName: 'Area 2',
    historyId: 'h2',
    createdAt: '2024-01-02',
    limitDate: '2024-01-11',
    tags: [],
  },
];

describe('useTaskList', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSWR.mockReturnValue({
      data: mockTasks,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    } as ReturnType<typeof useSWR>);
  });

  describe('SWR key selection', () => {
    test('uses member tasks key for member role', () => {
      renderHook(() =>
        useTaskList({ account: mockMemberAccount, id: 1 })
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/account/1/tasks',
        taskListFetcher,
        expect.any(Object)
      );
    });

    test('uses all tasks key for admin role with active type', () => {
      renderHook(() =>
        useTaskList({ account: mockAdminAccount, id: 2 })
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/tasks/all?type=all',
        taskListFetcher,
        expect.any(Object)
      );
    });

    test('uses ng tasks key when dataType is NG', () => {
      renderHook(() =>
        useTaskList({ account: mockAdminAccount, id: 2, initialType: 'NG' })
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/tasks/ng',
        taskListFetcher,
        expect.any(Object)
      );
    });
  });

  describe('data handling', () => {
    test('returns tasks data', () => {
      const { result } = renderHook(() =>
        useTaskList({ account: mockMemberAccount, id: 1 })
      );

      expect(result.current.data).toEqual(mockTasks);
    });

    test('returns empty array when no data', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() =>
        useTaskList({ account: mockMemberAccount, id: 1 })
      );

      expect(result.current.data).toEqual([]);
    });

    test('returns loading state', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: mockMutate,
      } as ReturnType<typeof useSWR>);

      const { result } = renderHook(() =>
        useTaskList({ account: mockMemberAccount, id: 1 })
      );

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('changeDataType', () => {
    test('changes dataType state', () => {
      const { result, rerender } = renderHook(() =>
        useTaskList({ account: mockAdminAccount, id: 2 })
      );

      expect(result.current.dataType).toBe('active');

      act(() => {
        result.current.changeDataType('NG');
      });

      rerender();

      expect(result.current.dataType).toBe('NG');
    });
  });

  describe('reloadCurrent', () => {
    test('calls mutate to reload data', () => {
      const { result } = renderHook(() =>
        useTaskList({ account: mockMemberAccount, id: 1 })
      );

      act(() => {
        result.current.reloadCurrent();
      });

      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('returns error message for TaskFetchError', () => {
      const taskFetchError = new TaskFetchError({
        type: 'api',
        status: 500,
        message: 'Server error',
      } as never);

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: taskFetchError,
        isLoading: false,
        isValidating: false,
        mutate: mockMutate,
      });

      const { result } = renderHook(() =>
        useTaskList({ account: mockMemberAccount, id: 1 })
      );

      expect(result.current.error).toBe('エラー (500): Server error');
    });

    test('returns null when no error', () => {
      const { result } = renderHook(() =>
        useTaskList({ account: mockMemberAccount, id: 1 })
      );

      expect(result.current.error).toBeNull();
    });
  });

  test('returns all expected properties', () => {
    const { result } = renderHook(() =>
      useTaskList({ account: mockMemberAccount, id: 1 })
    );

    expect(result.current.data).toBeDefined();
    expect(result.current.dataType).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.changeDataType).toBeDefined();
    expect(result.current.reloadCurrent).toBeDefined();
    expect(result.current.mutate).toBeDefined();
  });
});
