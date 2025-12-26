import { cookies } from 'next/headers';

import { getAuthHeaders } from '@/src/util/auth-headers';

// next/headersのcookies関数をモック
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('getAuthHeaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('トークンが存在する場合', () => {
    test('Authorizationヘッダーを含むオブジェクトを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'test-token-123' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result).toEqual({ Authorization: 'Bearer test-token-123' });
    });

    test('Bearer形式でトークンが設定される', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'jwt-token-xyz' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result.Authorization).toBe('Bearer jwt-token-xyz');
    });
  });

  describe('トークンが存在しない場合', () => {
    test('cookieが取得できない場合は空オブジェクトを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result).toEqual({});
    });

    test('cookieのvalueがundefinedの場合は空オブジェクトを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: undefined }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result).toEqual({});
    });
  });

  describe('cookies()の呼び出し', () => {
    test('tokenという名前のcookieを取得する', () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'token-value' });
      mockCookies.mockReturnValue({
        get: mockGet,
      } as unknown as ReturnType<typeof cookies>);

      getAuthHeaders();

      expect(mockGet).toHaveBeenCalledWith('token');
    });
  });

  describe('空文字トークンの場合', () => {
    test('空文字のトークンでもAuthorizationヘッダーを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: '' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      // 空文字は falsy なので空オブジェクトを返す
      expect(result).toEqual({});
    });
  });
});
