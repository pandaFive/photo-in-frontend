import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import React from 'react';
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

// SWRキャッシュをクリアするラッパー
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useTaskDetail (SWR版)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldFetch=false時の初期状態', () => {
    test('データ取得をスキップし空の初期状態を返す', () => {
      const { result } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, false),
        { wrapper }
      );

      expect(result.current.fileUrl).toBe('');
      expect(result.current.comments).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('shouldFetch=true時のデータ取得', () => {
    test('ファイルURLとコメントを正常に取得', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: true, value: mockComments });

      const { result } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.fileUrl).toBe('https://example.com/file.pdf');
      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test('正しいAPIエンドポイントを呼び出す', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: true, value: [] });

      const { result } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/aws?key=task-title');
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/comments?taskId=100&accountId=1'
      );
    });
  });

  describe('shouldFetchがfalseからtrueに変わった場合', () => {
    test('trueになった時点でデータを取得', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: true, value: mockComments });

      const { result, rerender } = renderHook(
        ({ shouldFetch }) => useTaskDetail(100, 'task-title', 1, shouldFetch),
        { wrapper, initialProps: { shouldFetch: false } }
      );

      // 初期状態: 取得しない
      expect(mockHttpClient.get).not.toHaveBeenCalled();
      expect(result.current.isLoaded).toBe(false);

      // shouldFetchをtrueに変更
      rerender({ shouldFetch: true });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.fileUrl).toBe('https://example.com/file.pdf');
      expect(result.current.comments).toEqual(mockComments);
    });
  });

  describe('SWRキャッシュ機能', () => {
    test('rerenderしても再取得しない（SWRの重複リクエスト防止）', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: true, value: mockComments });

      const { result, rerender } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);

      // 同じパラメータでrerender
      rerender();

      // データは維持され、追加の取得は発生しない
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.fileUrl).toBe('https://example.com/file.pdf');
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2); // 追加呼び出しなし
    });
  });

  describe('エラーハンドリング', () => {
    test('ファイル取得エラー時にエラーメッセージを返す', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: false, error: { type: 'api', status: 404, message: 'File not found' } })
        .mockResolvedValueOnce({ ok: true, value: mockComments });

      const { result } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBe('File not found');
      });

      expect(result.current.isLoaded).toBe(false);
    });

    test('コメント取得エラー時にエラーメッセージを返す', async () => {
      mockHttpClient.get
        .mockResolvedValueOnce({ ok: true, value: 'https://example.com/file.pdf' })
        .mockResolvedValueOnce({ ok: false, error: { type: 'api', status: 500, message: 'Server error' } });

      const { result } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Server error');
      });

      expect(result.current.isLoaded).toBe(false);
    });
  });

  describe('ローディング状態', () => {
    test('フェッチ中はisLoadingがtrue', async () => {
      let resolveFile: (value: unknown) => void;
      const filePromise = new Promise((resolve) => {
        resolveFile = resolve;
      });

      mockHttpClient.get
        .mockReturnValueOnce(filePromise as Promise<{ ok: true; value: string }>)
        .mockResolvedValueOnce({ ok: true, value: [] });

      const { result } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, true),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      resolveFile!({ ok: true, value: 'https://example.com/file.pdf' });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('戻り値の型', () => {
    test('必要なすべてのプロパティを返す', () => {
      const { result } = renderHook(
        () => useTaskDetail(100, 'task-title', 1, false),
        { wrapper }
      );

      expect(result.current.fileUrl).toBeDefined();
      expect(result.current.comments).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isLoaded).toBeDefined();
      expect(result.current.error).toBeDefined();
      // mutate関数も提供（再検証用）
      expect(result.current.mutate).toBeDefined();
    });
  });
});
