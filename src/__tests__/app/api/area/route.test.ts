/**
 * @jest-environment node
 */
/**
 * Area API Route Handler テスト
 *
 * POST /api/area - エリア新規作成
 * PUT /api/area - エリア更新
 */
import { NextRequest } from 'next/server';

// モック設定
const mockIsAuthenticated = jest.fn();
const mockIsAdminFromCookie = jest.fn();
const mockGetAuthHeaders = jest.fn();
const mockLogError = jest.fn();
const mockLogWarn = jest.fn();

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
  logDebug: jest.fn(),
}));

// fetchモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 環境変数
process.env.API_HOST = 'http://localhost:3000';

describe('POST /api/area', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    const module = await import('@/src/app/api/area/route');
    POST = module.POST;
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

      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: 'テストエリア' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors).toContain('認証が必要です');
    });

    it('管理者でない場合は403を返す', async () => {
      mockIsAdminFromCookie.mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: 'テストエリア' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.errors).toContain('この操作には管理者権限が必要です');
    });
  });

  describe('バリデーション', () => {
    it('不正なJSONの場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('リクエストボディのJSON形式が不正です');
    });

    it('nameが空の場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('エリア名は必須です');
    });

    it('nameがnullの場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: null }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('エリア名は必須です');
    });

    it('nameが32文字を超える場合は400を返す', async () => {
      const longName = 'あ'.repeat(33);
      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: longName }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('エリア名は32文字以内で入力してください');
    });
  });

  describe('成功ケース', () => {
    it('エリアを作成して返す', async () => {
      const mockArea = { id: 1, name: 'テストエリア' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockArea,
      });

      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: 'テストエリア' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockArea);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/areas',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({ area: { name: 'テストエリア' } }),
        }),
      );
    });
  });

  describe('エラーケース', () => {
    it('バックエンドエラー時はエラーメッセージを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => JSON.stringify({ error: 'エリア名は既に使用されています' }),
      });

      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: '既存エリア' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.errors).toBeDefined();
    });

    it('ネットワークエラー時は500を返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: 'テストエリア' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toContain('サーバーエラーが発生しました');
      expect(mockLogError).toHaveBeenCalled();
    });

    it('成功レスポンスのJSONパースに失敗した場合は502を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: 'テストエリア' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.errors).toContain('サーバーからの応答を解析できませんでした');
      expect(mockLogError).toHaveBeenCalled();
    });

    it('エラーレスポンスのテキスト読み取りに失敗した場合もエラーを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Read error');
        },
      });

      const request = new NextRequest('http://localhost/api/area', {
        method: 'POST',
        body: JSON.stringify({ name: 'テストエリア' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toBeDefined();
      expect(mockLogError).toHaveBeenCalled();
    });
  });
});

describe('PUT /api/area', () => {
  let PUT: (request: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    const module = await import('@/src/app/api/area/route');
    PUT = module.PUT;
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

  describe('認証・認可', () => {
    it('未認証の場合は401を返す', async () => {
      mockIsAuthenticated.mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors).toContain('認証が必要です');
    });

    it('管理者でない場合は403を返す', async () => {
      mockIsAdminFromCookie.mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.errors).toContain('この操作には管理者権限が必要です');
    });
  });

  describe('バリデーション', () => {
    it('idが無効な場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: -1, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('有効なエリアIDが必要です');
    });

    it('idが数値でない場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 'abc', name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('有効なエリアIDが必要です');
    });

    it('nameが空の場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('エリア名は必須です');
    });

    it('nameが32文字を超える場合は400を返す', async () => {
      const longName = 'あ'.repeat(33);
      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: longName }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('エリア名は32文字以内で入力してください');
    });
  });

  describe('成功ケース', () => {
    it('エリアを更新して返す', async () => {
      const mockArea = { id: 1, name: '更新エリア' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockArea,
      });

      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockArea);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/areas/1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({ area: { name: '更新エリア' } }),
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

      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 999, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.errors).toBeDefined();
    });

    it('ネットワークエラー時は500を返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toContain('サーバーエラーが発生しました');
      expect(mockLogError).toHaveBeenCalled();
    });

    it('成功レスポンスのJSONパースに失敗した場合は502を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.errors).toContain('サーバーからの応答を解析できませんでした');
      expect(mockLogError).toHaveBeenCalled();
    });

    it('エラーレスポンスのテキスト読み取りに失敗した場合もエラーを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Read error');
        },
      });

      const request = new NextRequest('http://localhost/api/area', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '更新エリア' }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toBeDefined();
      expect(mockLogError).toHaveBeenCalled();
    });
  });
});
