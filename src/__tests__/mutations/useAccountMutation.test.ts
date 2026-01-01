import { renderHook, act } from '@testing-library/react';
import { useAccountMutation } from '@/src/mutations/useAccountMutation';
import { httpClient } from '@/src/infra/http';

// httpClientをモック
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    delete: jest.fn(),
    put: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('useAccountMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAccount', () => {
    const mockMemberStatus = {
      id: 1,
      name: '更新メンバー',
      capacity: 10,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      area: ['エリアA'],
      total: 50,
      week: 5,
      ng_rate: 0.1,
      assign: 3,
    };

    test('returns success result on successful update', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: true,
        value: mockMemberStatus,
      });

      const { result } = renderHook(() => useAccountMutation());

      let response;
      await act(async () => {
        response = await result.current.updateAccount(1, '更新メンバー', [1], 10);
      });

      expect(response).toEqual({ success: true, data: mockMemberStatus });
      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/account', {
        id: 1,
        name: '更新メンバー',
        area: [1],
        capacity: 10,
      });
    });

    test('returns error result with errorType and statusCode on API failure', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 404, message: 'アカウントが見つかりません' },
      });

      const { result } = renderHook(() => useAccountMutation());

      let response;
      await act(async () => {
        response = await result.current.updateAccount(999, 'テスト', [], 5);
      });

      expect(response).toEqual({
        success: false,
        error: 'アカウントが見つかりません',
        errorType: 'api',
        statusCode: 404,
      });
    });

    test('returns error result with errorType on network failure', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: false,
        error: { type: 'network', message: 'ネットワークエラーが発生しました' },
      });

      const { result } = renderHook(() => useAccountMutation());

      let response;
      await act(async () => {
        response = await result.current.updateAccount(1, 'テスト', [], 5);
      });

      expect(response).toEqual({
        success: false,
        error: 'ネットワークエラーが発生しました',
        errorType: 'network',
        statusCode: undefined,
      });
    });

    test('handles empty area array', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: true,
        value: { ...mockMemberStatus, area: [] },
      });

      const { result } = renderHook(() => useAccountMutation());

      await act(async () => {
        await result.current.updateAccount(1, 'テスト', [], 5);
      });

      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/account', {
        id: 1,
        name: 'テスト',
        area: [],
        capacity: 5,
      });
    });

    test('handles multiple area IDs', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: true,
        value: mockMemberStatus,
      });

      const { result } = renderHook(() => useAccountMutation());

      await act(async () => {
        await result.current.updateAccount(1, 'テスト', [1, 2, 3], 5);
      });

      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/account', {
        id: 1,
        name: 'テスト',
        area: [1, 2, 3],
        capacity: 5,
      });
    });
  });

  describe('deleteAccount', () => {
    test('returns success result on successful deletion', async () => {
      mockHttpClient.delete.mockResolvedValueOnce({
        ok: true,
        value: {},
      });

      const { result } = renderHook(() => useAccountMutation());

      let response;
      await act(async () => {
        response = await result.current.deleteAccount(123);
      });

      // TYPE-001: 判別共用体により、success: trueの場合はdataが必須
      expect(response).toEqual({ success: true, data: undefined });
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/account/123');
    });

    test('returns error result with errorType and statusCode on API failure', async () => {
      mockHttpClient.delete.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 404, message: 'Account not found' },
      });

      const { result } = renderHook(() => useAccountMutation());

      let response;
      await act(async () => {
        response = await result.current.deleteAccount(999);
      });

      // TYPE-006: エラー時にerrorType, statusCodeを保持
      expect(response).toEqual({
        success: false,
        error: 'Account not found',
        errorType: 'api',
        statusCode: 404,
      });
    });

    test('returns error result with errorType and statusCode on forbidden', async () => {
      mockHttpClient.delete.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 403, message: 'Forbidden' },
      });

      const { result } = renderHook(() => useAccountMutation());

      let response;
      await act(async () => {
        response = await result.current.deleteAccount(1);
      });

      // TYPE-006: エラー時にerrorType, statusCodeを保持
      expect(response).toEqual({
        success: false,
        error: 'Forbidden',
        errorType: 'api',
        statusCode: 403,
      });
    });

    test('returns error result with errorType on network failure', async () => {
      mockHttpClient.delete.mockResolvedValueOnce({
        ok: false,
        error: { type: 'network', message: 'Network error' },
      });

      const { result } = renderHook(() => useAccountMutation());

      let response;
      await act(async () => {
        response = await result.current.deleteAccount(1);
      });

      // TYPE-006: ネットワークエラー時はstatusCodeなし
      expect(response).toEqual({
        success: false,
        error: 'Network error',
        errorType: 'network',
        statusCode: undefined,
      });
    });

    test('calls correct API endpoint with account ID', async () => {
      mockHttpClient.delete.mockResolvedValueOnce({
        ok: true,
        value: {},
      });

      const { result } = renderHook(() => useAccountMutation());

      await act(async () => {
        await result.current.deleteAccount(456);
      });

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/account/456');
    });
  });

  test('hook returns deleteAccount and updateAccount functions', () => {
    const { result } = renderHook(() => useAccountMutation());

    expect(result.current.deleteAccount).toBeDefined();
    expect(typeof result.current.deleteAccount).toBe('function');
    expect(result.current.updateAccount).toBeDefined();
    expect(typeof result.current.updateAccount).toBe('function');
  });
});
