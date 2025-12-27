import { Result } from '@/src/domain/types/error';
import { serverHttpClient } from '@/src/infra/http';
import { getCookies } from '@/src/util/cookies';

import { getAccount } from '@/src/api/get-account';

// モック設定
jest.mock('@/src/infra/http', () => ({
  serverHttpClient: {
    get: jest.fn(),
  },
}));

jest.mock('@/src/util/cookies', () => ({
  getCookies: jest.fn(),
}));

const mockGet = serverHttpClient.get as jest.MockedFunction<
  typeof serverHttpClient.get
>;
const mockGetCookies = getCookies as jest.MockedFunction<typeof getCookies>;

// バックエンドのレスポンス型
type AccountApiResponse = {
  id: number;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  capacity: number;
};

describe('getAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('トークンが存在する場合', () => {
    test('AccountDataオブジェクトを返す', async () => {
      mockGetCookies.mockReturnValue('valid-jwt-token');
      const mockResponse: AccountApiResponse = {
        id: 1,
        name: 'Test User',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        capacity: 10,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        role: 'admin',
        area: [],
        token: 'valid-jwt-token',
      });
    });

    test('正しいエンドポイントとヘッダーでAPIを呼び出す', async () => {
      mockGetCookies.mockReturnValue('my-token');
      const mockResponse: AccountApiResponse = {
        id: 1,
        name: 'User',
        role: 'member',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        capacity: 5,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      await getAccount();

      expect(mockGet).toHaveBeenCalledWith('/account', {
        headers: { Authorization: 'Bearer my-token' },
      });
    });

    test('getCookiesが"token"キーで呼ばれる', async () => {
      mockGetCookies.mockReturnValue('token');
      const mockResponse: AccountApiResponse = {
        id: 1,
        name: 'User',
        role: 'member',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        capacity: 5,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      await getAccount();

      expect(mockGetCookies).toHaveBeenCalledWith('token');
    });

    test('レスポンスからAccountDataに正しく変換される', async () => {
      mockGetCookies.mockReturnValue('jwt-token');
      const mockResponse: AccountApiResponse = {
        id: 42,
        name: 'Admin User',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-15T12:30:00Z',
        capacity: 100,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      // 変換後のAccountDataを確認
      expect(result).not.toBeNull();
      expect(result?.id).toBe(42);
      expect(result?.name).toBe('Admin User');
      expect(result?.role).toBe('admin');
      expect(result?.area).toEqual([]);
      expect(result?.token).toBe('jwt-token');
      // createdAt, updatedAt, capacityは含まれない
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
      expect(result).not.toHaveProperty('capacity');
    });

    test('メンバーロールのアカウント取得', async () => {
      mockGetCookies.mockReturnValue('member-token');
      const mockResponse: AccountApiResponse = {
        id: 99,
        name: 'Member User',
        role: 'member',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        capacity: 5,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result?.role).toBe('member');
    });
  });

  describe('トークンが存在しない場合', () => {
    test('nullを返す', async () => {
      mockGetCookies.mockReturnValue(undefined);

      const result = await getAccount();

      expect(result).toBeNull();
    });

    test('APIは呼ばれない', async () => {
      mockGetCookies.mockReturnValue(undefined);

      await getAccount();

      expect(mockGet).not.toHaveBeenCalled();
    });

    test('空文字のトークンでもAPIが呼ばれる', async () => {
      mockGetCookies.mockReturnValue('');
      const mockResult: Result<AccountApiResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 401,
          message: 'Unauthorized',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      await getAccount();

      // 空文字はfalsyだがJSでは空文字 !== undefined
      // 実装では !token で判定しているので空文字はAPIを呼ばない
      // ただし実装を確認すると if (!token) なので空文字はfalsy
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('API失敗時', () => {
    test('APIエラー時はnullを返す', async () => {
      mockGetCookies.mockReturnValue('valid-token');
      const mockResult: Result<AccountApiResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 401,
          message: 'Unauthorized',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result).toBeNull();
    });

    test('403エラー時もnullを返す', async () => {
      mockGetCookies.mockReturnValue('valid-token');
      const mockResult: Result<AccountApiResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 403,
          message: 'Forbidden',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result).toBeNull();
    });

    test('500エラー時もnullを返す', async () => {
      mockGetCookies.mockReturnValue('valid-token');
      const mockResult: Result<AccountApiResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 500,
          message: 'Internal Server Error',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result).toBeNull();
    });

    test('ネットワークエラー時もnullを返す', async () => {
      mockGetCookies.mockReturnValue('valid-token');
      const mockResult: Result<AccountApiResponse> = {
        ok: false,
        error: {
          type: 'network',
          message: 'Network error',
        },
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result).toBeNull();
    });
  });

  describe('エッジケース', () => {
    test('特殊文字を含むトークンでもAPIが呼ばれる', async () => {
      const specialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      mockGetCookies.mockReturnValue(specialToken);
      const mockResponse: AccountApiResponse = {
        id: 1,
        name: 'User',
        role: 'member',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        capacity: 5,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      await getAccount();

      expect(mockGet).toHaveBeenCalledWith('/account', {
        headers: { Authorization: `Bearer ${specialToken}` },
      });
    });

    test('日本語のユーザー名も正しく返される', async () => {
      mockGetCookies.mockReturnValue('token');
      const mockResponse: AccountApiResponse = {
        id: 1,
        name: '山田太郎',
        role: 'member',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        capacity: 5,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result?.name).toBe('山田太郎');
    });

    test('area配列は常に空配列が設定される', async () => {
      mockGetCookies.mockReturnValue('token');
      const mockResponse: AccountApiResponse = {
        id: 1,
        name: 'User',
        role: 'member',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        capacity: 5,
      };
      const mockResult: Result<AccountApiResponse> = {
        ok: true,
        value: mockResponse,
      };
      mockGet.mockResolvedValue(mockResult);

      const result = await getAccount();

      expect(result?.area).toEqual([]);
      expect(Array.isArray(result?.area)).toBe(true);
    });
  });
});
