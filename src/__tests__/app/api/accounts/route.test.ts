/**
 * @jest-environment node
 */
/**
 * Accounts API Route Handler テスト
 *
 * GET /api/accounts - メンバー一覧取得
 */

// モック設定
const mockIsAuthenticated = jest.fn();
const mockIsAdminFromCookie = jest.fn();
const mockGetAuthHeaders = jest.fn();
const mockLogError = jest.fn();

jest.mock('@/src/util/auth-check', () => ({
  isAuthenticated: () => mockIsAuthenticated(),
  isAdminFromCookie: () => mockIsAdminFromCookie(),
}));

jest.mock('@/src/util/auth-headers', () => ({
  getAuthHeaders: () => mockGetAuthHeaders(),
}));

jest.mock('@/src/util/safe-logger', () => ({
  logError: (...args: unknown[]) => mockLogError(...args),
  logWarn: jest.fn(),
  logDebug: jest.fn(),
}));

// fetchモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 環境変数
process.env.API_HOST = 'http://localhost:3000';

describe('GET /api/accounts', () => {
  let GET: () => Promise<Response>;

  beforeAll(async () => {
    const module = await import('@/src/app/api/accounts/route');
    GET = module.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルト: 認証・認可成功
    mockIsAuthenticated.mockReturnValue(true);
    mockIsAdminFromCookie.mockReturnValue(true);
    mockGetAuthHeaders.mockReturnValue({
      ok: true,
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  describe('認証・認可', () => {
    it('未認証の場合は401を返す', async () => {
      mockIsAuthenticated.mockReturnValue(false);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors).toContain('認証が必要です');
    });

    it('管理者でない場合は403を返す', async () => {
      mockIsAdminFromCookie.mockReturnValue(false);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.errors).toContain('この操作には管理者権限が必要です');
    });
  });

  describe('成功ケース', () => {
    it('メンバー一覧を返す', async () => {
      const mockMembers = [
        {
          id: 1,
          name: '山田太郎',
          capacity: 5,
          area: ['エリアA'],
          total: 10,
          week: 2,
          ng_rate: 0.1,
          assign: 3,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
        {
          id: 2,
          name: '佐藤花子',
          capacity: 3,
          area: [],
          total: 5,
          week: 1,
          ng_rate: 0,
          assign: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembers,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMembers);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/accounts',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('空配列を返す場合も正常に動作する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('エラーケース', () => {
    it('バックエンドエラー時はエラーメッセージを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ error: 'サーバーエラー' }),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toBeDefined();
    });

    it('ネットワークエラー時は500を返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toContain('サーバーエラーが発生しました');
      expect(mockLogError).toHaveBeenCalled();
    });

    it('JSONパースエラー時は502を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.errors).toContain('バックエンドから不正なレスポンスを受信しました');
      expect(mockLogError).toHaveBeenCalled();
    });

    it('エラーレスポンスのテキスト読み取り失敗時もエラーを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Read error');
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toBeDefined();
      expect(mockLogError).toHaveBeenCalled();
    });
  });
});
