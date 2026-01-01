/**
 * @jest-environment node
 */
/**
 * Account API Route Handler テスト
 *
 * PUT /api/account - メンバー情報更新
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

describe('PUT /api/account', () => {
  let PUT: (request: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    const module = await import('@/src/app/api/account/route');
    PUT = module.PUT;
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

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.errors).toContain('認証が必要です');
    });

    it('管理者でない場合は403を返す', async () => {
      mockIsAdminFromCookie.mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.errors).toContain('この操作には管理者権限が必要です');
    });
  });

  describe('バリデーション', () => {
    it('不正なJSONの場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: 'invalid json',
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('リクエストボディのJSON形式が不正です');
    });

    it('idが無効な場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: -1, name: 'テスト', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('有効なアカウントIDが必要です');
    });

    it('idが数値でない場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 'abc', name: 'テスト', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('有効なアカウントIDが必要です');
    });

    it('nameが空の場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('名前は必須です');
    });

    it('nameがnullの場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: null, area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('名前は必須です');
    });

    it('nameが32文字を超える場合は400を返す', async () => {
      const longName = 'あ'.repeat(33);
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: longName, area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('名前は32文字以内で入力してください');
    });

    it('areaが配列でない場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: 'invalid', capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('エリアは配列で指定してください');
    });

    it('areaに無効なIDが含まれる場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [1, -2, 3], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('エリアIDは正の整数で指定してください');
    });

    it('capacityが負数の場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: -1 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('1日の最大撮影数は0以上1000以下の整数で入力してください');
    });

    it('capacityが整数でない場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 1.5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('1日の最大撮影数は0以上1000以下の整数で入力してください');
    });

    it('capacityが上限を超える場合は400を返す', async () => {
      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 1001 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.errors).toContain('1日の最大撮影数は0以上1000以下の整数で入力してください');
    });
  });

  describe('成功ケース', () => {
    it('メンバー情報を更新して返す', async () => {
      const mockAccount = {
        id: 1,
        name: '更新メンバー',
        area: ['エリアA'],
        capacity: 10,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccount,
      });

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '更新メンバー', area: [1], capacity: 10 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAccount);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/accounts/1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({
            account: { name: '更新メンバー', area: [1], capacity: 10 },
          }),
        }),
      );
    });

    it('nameの前後の空白をトリムして更新する', async () => {
      const mockAccount = { id: 1, name: '更新メンバー', area: [], capacity: 5 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccount,
      });

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '  更新メンバー  ', area: [], capacity: 5 }),
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            account: { name: '更新メンバー', area: [], capacity: 5 },
          }),
        }),
      );
    });

    it('areaが空配列でも更新できる', async () => {
      const mockAccount = { id: 1, name: 'テスト', area: [], capacity: 5 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccount,
      });

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 5 }),
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
    });

    it('capacityが0でも更新できる', async () => {
      const mockAccount = { id: 1, name: 'テスト', area: [], capacity: 0 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccount,
      });

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 0 }),
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
    });
  });

  describe('エラーケース', () => {
    it('存在しないアカウントの場合は404を返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: 'アカウントが見つかりません' }),
      });

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 999, name: 'テスト', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.errors).toBeDefined();
    });

    it('バックエンドエラー時はエラーメッセージを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => JSON.stringify({ error: '名前は既に使用されています' }),
      });

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: '既存名', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.errors).toBeDefined();
    });

    it('ネットワークエラー時は500を返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 5 }),
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

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 5 }),
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

      const request = new NextRequest('http://localhost/api/account', {
        method: 'PUT',
        body: JSON.stringify({ id: 1, name: 'テスト', area: [], capacity: 5 }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.errors).toBeDefined();
      expect(mockLogError).toHaveBeenCalled();
    });
  });
});
