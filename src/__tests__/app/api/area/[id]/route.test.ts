/**
 * @jest-environment node
 */
/**
 * Area DELETE API Route Handler テスト
 *
 * DELETE /api/area/[id] - エリア削除
 */
import { NextRequest } from 'next/server';

// モック設定
const mockIsAuthenticated = jest.fn();
const mockIsAdminFromCookie = jest.fn();
const mockGetAuthHeaders = jest.fn();
const mockLogError = jest.fn();
const mockLogWarn = jest.fn();
const mockLogDebug = jest.fn();

jest.mock('@/src/util/auth-check', () => ({
  isAuthenticated: () => mockIsAuthenticated(),
  isAdminFromCookie: () => mockIsAdminFromCookie(),
}));

jest.mock('@/src/util/auth-headers', () => ({
  getAuthHeaders: () => mockGetAuthHeaders(),
}));

jest.mock('@/src/util/safe-logger', () => ({
  logError: (...args: unknown[]) => mockLogError(...args),
  logWarn: (...args: unknown[]) => mockLogWarn(...args),
  logDebug: (...args: unknown[]) => mockLogDebug(...args),
}));

// fetchモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 環境変数
process.env.API_HOST = 'http://localhost:3000';

describe('DELETE /api/area/[id]', () => {
  let DELETE: (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => Promise<Response>;

  beforeAll(async () => {
    const module = await import('@/src/app/api/area/[id]/route');
    DELETE = module.DELETE;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(true);
    mockIsAdminFromCookie.mockReturnValue(true);
    mockGetAuthHeaders.mockReturnValue({
      ok: true,
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  const createRequest = (id: string) => {
    return new NextRequest(`http://localhost/api/area/${id}`, {
      method: 'DELETE',
    });
  };

  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  describe('認証・認可', () => {
    it('未認証の場合は401を返す', async () => {
      mockIsAuthenticated.mockReturnValue(false);

      const response = await DELETE(createRequest('1'), createContext('1'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors).toContain('認証が必要です');
    });

    it('管理者でない場合は403を返す', async () => {
      mockIsAdminFromCookie.mockReturnValue(false);

      const response = await DELETE(createRequest('1'), createContext('1'));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.errors).toContain('この操作には管理者権限が必要です');
    });
  });

  describe('バリデーション', () => {
    it('idが無効な場合は400を返す', async () => {
      const response = await DELETE(createRequest('abc'), createContext('abc'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
    });

    it('idが負の数の場合は400を返す', async () => {
      const response = await DELETE(createRequest('-1'), createContext('-1'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
    });

    it('idが0の場合は400を返す', async () => {
      const response = await DELETE(createRequest('0'), createContext('0'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toBeDefined();
    });
  });

  describe('成功ケース', () => {
    it('エリアを削除して成功メッセージを返す', async () => {
      const mockResponse = { message: 'エリアを削除しました' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await DELETE(createRequest('1'), createContext('1'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/areas/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });

  describe('エラーケース', () => {
    it('存在しないエリアの場合は404を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: 'エリアが見つかりません' }),
      });

      const response = await DELETE(createRequest('999'), createContext('999'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.errors).toBeDefined();
    });

    it('使用中のエリアの場合は409を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () =>
          JSON.stringify({ error: 'このエリアは使用中のため削除できません' }),
      });

      const response = await DELETE(createRequest('1'), createContext('1'));
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.errors).toBeDefined();
    });

    it('ネットワークエラー時は500を返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await DELETE(createRequest('1'), createContext('1'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toContain('サーバーエラーが発生しました');
      expect(mockLogError).toHaveBeenCalled();
    });
  });
});
