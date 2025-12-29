import { renderHook, act } from '@testing-library/react';
import { useAccountMutation } from '@/src/mutations/useAccountMutation';
import { httpClient } from '@/src/infra/http';

// httpClientをモック
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    delete: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('useAccountMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  test('hook returns deleteAccount function', () => {
    const { result } = renderHook(() => useAccountMutation());

    expect(result.current.deleteAccount).toBeDefined();
    expect(typeof result.current.deleteAccount).toBe('function');
  });
});
