/**
 * useAreaMutation テスト
 *
 * エリアCRUD操作のMutation Hook
 */
import { renderHook, act } from '@testing-library/react';

import { httpClient } from '@/src/infra/http';

// httpClientをモック
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/src/util/safe-logger', () => ({
  logError: jest.fn(),
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('useAreaMutation', () => {
  let useAreaMutation: typeof import('@/src/mutations/useAreaMutation').useAreaMutation;

  beforeAll(async () => {
    const module = await import('@/src/mutations/useAreaMutation');
    useAreaMutation = module.useAreaMutation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createArea', () => {
    it('成功時にエリアデータを返す', async () => {
      const mockArea = { id: 1, name: 'テストエリア' };
      mockHttpClient.post.mockResolvedValueOnce({ ok: true, value: mockArea });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.createArea>>;
      await act(async () => {
        mutationResult = await result.current.createArea('テストエリア');
      });

      expect(mutationResult!.success).toBe(true);
      if (mutationResult!.success) {
        expect(mutationResult!.data).toEqual(mockArea);
      }
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/area', { name: 'テストエリア' });
    });

    it('APIエラー時にエラー情報を返す', async () => {
      const mockError = { type: 'api', status: 422, message: 'エリア名は既に使用されています' };
      mockHttpClient.post.mockResolvedValueOnce({ ok: false, error: mockError });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.createArea>>;
      await act(async () => {
        mutationResult = await result.current.createArea('既存エリア');
      });

      expect(mutationResult!.success).toBe(false);
      if (!mutationResult!.success) {
        expect(mutationResult!.error).toBe('エリア名は既に使用されています');
        expect(mutationResult!.errorType).toBe('api');
        expect(mutationResult!.statusCode).toBe(422);
      }
    });

    it('ネットワークエラー時にエラー情報を返す', async () => {
      const mockError = { type: 'network', message: 'ネットワークエラー' };
      mockHttpClient.post.mockResolvedValueOnce({ ok: false, error: mockError });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.createArea>>;
      await act(async () => {
        mutationResult = await result.current.createArea('テストエリア');
      });

      expect(mutationResult!.success).toBe(false);
      if (!mutationResult!.success) {
        expect(mutationResult!.error).toBe('ネットワークエラー');
        expect(mutationResult!.errorType).toBe('network');
        expect(mutationResult!.statusCode).toBeUndefined();
      }
    });
  });

  describe('updateArea', () => {
    it('成功時に更新されたエリアデータを返す', async () => {
      const mockArea = { id: 1, name: '更新エリア' };
      mockHttpClient.put.mockResolvedValueOnce({ ok: true, value: mockArea });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.updateArea>>;
      await act(async () => {
        mutationResult = await result.current.updateArea(1, '更新エリア');
      });

      expect(mutationResult!.success).toBe(true);
      if (mutationResult!.success) {
        expect(mutationResult!.data).toEqual(mockArea);
      }
      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/area', { id: 1, name: '更新エリア' });
    });

    it('存在しないエリアの場合はエラーを返す', async () => {
      const mockError = { type: 'api', status: 404, message: 'エリアが見つかりません' };
      mockHttpClient.put.mockResolvedValueOnce({ ok: false, error: mockError });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.updateArea>>;
      await act(async () => {
        mutationResult = await result.current.updateArea(999, '更新エリア');
      });

      expect(mutationResult!.success).toBe(false);
      if (!mutationResult!.success) {
        expect(mutationResult!.error).toBe('エリアが見つかりません');
        expect(mutationResult!.statusCode).toBe(404);
      }
    });
  });

  describe('deleteArea', () => {
    it('成功時にメッセージを返す', async () => {
      const mockResponse = { message: 'エリアを削除しました' };
      mockHttpClient.delete.mockResolvedValueOnce({ ok: true, value: mockResponse });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.deleteArea>>;
      await act(async () => {
        mutationResult = await result.current.deleteArea(1);
      });

      expect(mutationResult!.success).toBe(true);
      if (mutationResult!.success) {
        expect(mutationResult!.data).toEqual(mockResponse);
      }
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/area/1');
    });

    it('使用中のエリアの場合はエラーを返す', async () => {
      const mockError = { type: 'api', status: 409, message: 'このエリアは使用中のため削除できません' };
      mockHttpClient.delete.mockResolvedValueOnce({ ok: false, error: mockError });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.deleteArea>>;
      await act(async () => {
        mutationResult = await result.current.deleteArea(1);
      });

      expect(mutationResult!.success).toBe(false);
      if (!mutationResult!.success) {
        expect(mutationResult!.error).toBe('このエリアは使用中のため削除できません');
        expect(mutationResult!.statusCode).toBe(409);
      }
    });

    it('存在しないエリアの場合はエラーを返す', async () => {
      const mockError = { type: 'api', status: 404, message: 'エリアが見つかりません' };
      mockHttpClient.delete.mockResolvedValueOnce({ ok: false, error: mockError });

      const { result } = renderHook(() => useAreaMutation());

      let mutationResult: Awaited<ReturnType<typeof result.current.deleteArea>>;
      await act(async () => {
        mutationResult = await result.current.deleteArea(999);
      });

      expect(mutationResult!.success).toBe(false);
      if (!mutationResult!.success) {
        expect(mutationResult!.error).toBe('エリアが見つかりません');
        expect(mutationResult!.statusCode).toBe(404);
      }
    });
  });

  describe('Hook安定性', () => {
    it('複数回レンダーしても同じ関数参照を返す', () => {
      const { result, rerender } = renderHook(() => useAreaMutation());

      const { createArea: create1, updateArea: update1, deleteArea: delete1 } = result.current;

      rerender();

      expect(result.current.createArea).toBe(create1);
      expect(result.current.updateArea).toBe(update1);
      expect(result.current.deleteArea).toBe(delete1);
    });
  });
});
