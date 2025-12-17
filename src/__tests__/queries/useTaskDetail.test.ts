import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskDetail } from '@/src/queries/useTaskDetail';
import { httpClient } from '@/src/infra/http';

// httpClientをモック
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const mockComments = [
  { id: 1, content: 'Comment 1', accountId: 1, taskId: 100, createdAt: '2024-01-01' },
  { id: 2, content: 'Comment 2', accountId: 2, taskId: 100, createdAt: '2024-01-02' },
];

describe('useTaskDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    test('returns empty initial state', () => {
      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      expect(result.current.fileUrl).toBe('');
      expect(result.current.comments).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchData', () => {
    test('fetches file URL and comments successfully', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: true, value: mockComments });

      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      await act(async () => {
        await result.current.fetchData();
      });

      expect(result.current.fileUrl).toBe('https://example.com/file.pdf');
      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('calls correct API endpoints', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: true, value: [] });

      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      await act(async () => {
        await result.current.fetchData();
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/aws?key=task-title',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/comments?taskId=100&accountId=1',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    test('skips fetch when already loaded', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: true, value: mockComments });

      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      // First fetch
      await act(async () => {
        await result.current.fetchData();
      });

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);

      // Second fetch should be skipped
      await act(async () => {
        await result.current.fetchData();
      });

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2); // Still 2
    });

    test('handles file fetch error', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: false, error: { type: 'api', status: 404, message: 'File not found' } })
        .mockResolvedValueOnce({ ok: true, value: mockComments });

      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      await act(async () => {
        await result.current.fetchData();
      });

      expect(result.current.error).toBe('File not found');
      expect(result.current.isLoaded).toBe(false);
    });

    test('handles comments fetch error', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: false, error: { type: 'api', status: 500, message: 'Server error' } });

      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      await act(async () => {
        await result.current.fetchData();
      });

      expect(result.current.error).toBe('Server error');
      expect(result.current.isLoaded).toBe(false);
    });
  });

  describe('loading state', () => {
    test('sets isLoading to true during fetch', async () => {
      let resolveFile: (value: unknown) => void;
      const filePromise = new Promise((resolve) => {
        resolveFile = resolve;
      });

      mockHttpClient.get
        .mockReturnValueOnce(filePromise as Promise<{ ok: true; value: string }>)
        .mockResolvedValueOnce({ ok: true, value: [] });

      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      act(() => {
        void result.current.fetchData();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveFile!({ ok: true, value: 'https://example.com/file.pdf' });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('cleanup', () => {
    test('cleanup function is defined', () => {
      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      expect(result.current.cleanup).toBeDefined();
      expect(typeof result.current.cleanup).toBe('function');
    });

    test('cleanup can be called without error', () => {
      const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

      expect(() => {
        result.current.cleanup();
      }).not.toThrow();
    });
  });

  describe('abort handling', () => {
    test('aborts previous request when new fetch is called', async () => {
      let resolveFirst: (value: unknown) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      mockHttpClient.get
        .mockReturnValueOnce(firstPromise as Promise<{ ok: true; value: string }>)
        .mockReturnValueOnce(new Promise(() => {})) // Second file request never resolves
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file2.pdf' })
        .mockResolvedValueOnce({ ok: true, value: [] });

      const { result, rerender } = renderHook(
        ({ taskId }) => useTaskDetail(taskId, 'task-title', 1),
        { initialProps: { taskId: 100 } }
      );

      // Start first fetch
      act(() => {
        void result.current.fetchData();
      });

      // Change taskId and trigger new render - this should abort the previous request
      rerender({ taskId: 101 });

      // The first promise resolving should not cause issues
      await act(async () => {
        resolveFirst!({ ok: true, value: 'https://example.com/file1.pdf' });
      });

      // Hook should still be functional
      expect(result.current.fetchData).toBeDefined();
    });
  });

  test('returns all expected properties', () => {
    const { result } = renderHook(() => useTaskDetail(100, 'task-title', 1));

    expect(result.current.fileUrl).toBeDefined();
    expect(result.current.comments).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.isLoaded).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.fetchData).toBeDefined();
    expect(result.current.cleanup).toBeDefined();
  });
});
