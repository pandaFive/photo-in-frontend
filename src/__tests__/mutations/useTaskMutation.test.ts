import { renderHook, act } from '@testing-library/react';
import { useTaskMutation } from '@/src/mutations/useTaskMutation';
import { httpClient } from '@/src/infra/http';
import { Task } from '@/src/types';

// httpClientをモック
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    put: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const mockTasks: Task[] = [
  {
    id: 1,
    task_title: 'Task 1',
    area_name: 'Area 1',
    history_id: 1,
    assign_cycle_id: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    task_title: 'Task 2',
    area_name: 'Area 2',
    history_id: 2,
    assign_cycle_id: 2,
    created_at: '2024-01-02T00:00:00Z',
  },
];

describe('useTaskMutation', () => {
  let mockMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate = jest.fn();
  });

  describe('completeTask', () => {
    test('calls mutate with correct parameters on success', async () => {
      mockHttpClient.put.mockResolvedValueOnce({ ok: true, value: {} });
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      let response;
      await act(async () => {
        response = await result.current.completeTask(1, 'h1');
      });

      // TYPE-001: 判別共用体により、success: trueの場合はdataが必須
      expect(response).toEqual({ success: true, data: undefined });
      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/task/h1/complete');
      expect(mockMutate).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          optimisticData: expect.any(Function),
          rollbackOnError: true,
          revalidate: false,
        })
      );
    });

    test('returns error on API failure', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 500, message: 'Server error' },
      });
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      let response;
      await act(async () => {
        response = await result.current.completeTask(1, 'h1');
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe('Server error');
    });

    test('prevents duplicate requests for same task', async () => {
      let resolveFirst: () => void;
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });

      mockHttpClient.put.mockReturnValueOnce(
        firstPromise.then(() => ({ ok: true, value: {} }))
      );
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      // Start first request
      let firstResponse: { success: boolean; error?: string } | undefined;
      act(() => {
        void result.current.completeTask(1, 'h1').then((r) => {
          firstResponse = r;
        });
      });

      // Try second request immediately
      let secondResponse;
      await act(async () => {
        secondResponse = await result.current.completeTask(1, 'h1');
      });

      expect(secondResponse).toEqual({ success: false, error: '処理中です' });

      // Complete first request
      await act(async () => {
        resolveFirst!();
      });
    });
  });

  describe('markAsNG', () => {
    test('calls mutate with correct parameters on success', async () => {
      mockHttpClient.put.mockResolvedValueOnce({ ok: true, value: {} });
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      let response;
      await act(async () => {
        response = await result.current.markAsNG(1, 'h1');
      });

      // TYPE-001: 判別共用体により、success: trueの場合はdataが必須
      expect(response).toEqual({ success: true, data: undefined });
      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/task/h1/ng');
    });

    test('returns error on API failure', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 403, message: 'Forbidden' },
      });
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      let response;
      await act(async () => {
        response = await result.current.markAsNG(1, 'h1');
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe('Forbidden');
    });

    test('prevents duplicate requests for same task', async () => {
      let resolveFirst: () => void;
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });

      mockHttpClient.put.mockReturnValueOnce(
        firstPromise.then(() => ({ ok: true, value: {} }))
      );
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      // Start first request
      act(() => {
        void result.current.markAsNG(2, 'h2');
      });

      // Try second request immediately
      let secondResponse;
      await act(async () => {
        secondResponse = await result.current.markAsNG(2, 'h2');
      });

      expect(secondResponse).toEqual({ success: false, error: '処理中です' });

      // Complete first request
      await act(async () => {
        resolveFirst!();
      });
    });
  });

  describe('reassign', () => {
    test('calls mutate with correct parameters on success', async () => {
      mockHttpClient.put.mockResolvedValueOnce({ ok: true, value: {} });
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      let response;
      await act(async () => {
        response = await result.current.reassign(1, 't1');
      });

      // TYPE-001: 判別共用体により、success: trueの場合はdataが必須
      expect(response).toEqual({ success: true, data: undefined });
      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/task/t1/reassign');
    });

    test('returns error on API failure', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 404, message: 'Task not found' },
      });
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      let response;
      await act(async () => {
        response = await result.current.reassign(1, 't1');
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toBe('Task not found');
    });

    test('prevents duplicate requests for same task', async () => {
      let resolveFirst: () => void;
      const firstPromise = new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });

      mockHttpClient.put.mockReturnValueOnce(
        firstPromise.then(() => ({ ok: true, value: {} }))
      );
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      // Start first request
      act(() => {
        void result.current.reassign(1, 't1');
      });

      // Try second request immediately
      let secondResponse;
      await act(async () => {
        secondResponse = await result.current.reassign(1, 't1');
      });

      expect(secondResponse).toEqual({ success: false, error: '処理中です' });

      // Complete first request
      await act(async () => {
        resolveFirst!();
      });
    });
  });

  describe('isPending', () => {
    test('returns false when task is not pending', () => {
      const { result } = renderHook(() => useTaskMutation(mockMutate));

      expect(result.current.isPending(1)).toBe(false);
    });

    test('returns true when task is pending', async () => {
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      mockHttpClient.put.mockReturnValueOnce(
        requestPromise.then(() => ({ ok: true, value: {} }))
      );
      mockMutate.mockImplementation(async (updater) => {
        if (typeof updater === 'function') {
          await updater(mockTasks);
        }
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      // Start request
      act(() => {
        void result.current.completeTask(1, 'h1');
      });

      // Check pending state
      expect(result.current.isPending(1)).toBe(true);

      // Complete request
      await act(async () => {
        resolveRequest!();
      });

      // Should no longer be pending
      expect(result.current.isPending(1)).toBe(false);
    });
  });

  describe('optimistic data', () => {
    test('optimisticData function filters out completed task', async () => {
      mockHttpClient.put.mockResolvedValueOnce({ ok: true, value: {} });

      let capturedOptimisticData: ((data: Task[] | undefined) => Task[] | undefined) | undefined;
      mockMutate.mockImplementation(async (_updater, options) => {
        capturedOptimisticData = options?.optimisticData as typeof capturedOptimisticData;
      });

      const { result } = renderHook(() => useTaskMutation(mockMutate));

      await act(async () => {
        await result.current.completeTask(1, 'h1');
      });

      // Test the optimistic data function
      const optimisticResult = capturedOptimisticData?.(mockTasks);
      expect(optimisticResult).toEqual([mockTasks[1]]); // Task 1 removed
    });
  });

  test('hook returns all expected functions', () => {
    const { result } = renderHook(() => useTaskMutation(mockMutate));

    expect(result.current.completeTask).toBeDefined();
    expect(result.current.markAsNG).toBeDefined();
    expect(result.current.reassign).toBeDefined();
    expect(result.current.isPending).toBeDefined();
    expect(typeof result.current.completeTask).toBe('function');
    expect(typeof result.current.markAsNG).toBe('function');
    expect(typeof result.current.reassign).toBe('function');
    expect(typeof result.current.isPending).toBe('function');
  });
});
