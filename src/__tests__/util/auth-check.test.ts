import { cookies } from 'next/headers';

import { isAuthenticated, isAdminFromCookie } from '@/src/util/auth-check';

// next/headersのcookies関数をモック
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

// console.errorのモック
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('isAuthenticated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('トークンが存在する場合', () => {
    test('trueを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAuthenticated();

      expect(result).toBe(true);
    });
  });

  describe('トークンが存在しない場合', () => {
    test('cookieが取得できない場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    test('cookieのvalueがundefinedの場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: undefined }),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });

    test('空文字のトークンはfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: '' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('Cookie取得例外の場合', () => {
    test('cookies()が例外をスローした場合はfalseを返す（Fail Secure）', () => {
      const testError = new Error('Server Component context error');
      mockCookies.mockImplementation(() => {
        throw testError;
      });

      const result = isAuthenticated();

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[isAuthenticated] Cookie取得エラー:',
        testError,
      );
    });
  });

  describe('cookies()の呼び出し', () => {
    test('tokenという名前のcookieを取得する', () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'token-value' });
      mockCookies.mockReturnValue({
        get: mockGet,
      } as unknown as ReturnType<typeof cookies>);

      isAuthenticated();

      expect(mockGet).toHaveBeenCalledWith('token');
    });
  });
});

describe('isAdminFromCookie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('管理者ロールの場合', () => {
    test('role=adminの場合はtrueを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'admin' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAdminFromCookie();

      expect(result).toBe(true);
    });
  });

  describe('管理者ロールではない場合', () => {
    test('role=memberの場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'member' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAdminFromCookie();

      expect(result).toBe(false);
    });

    test('role cookieが存在しない場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAdminFromCookie();

      expect(result).toBe(false);
    });

    test('role cookieのvalueがundefinedの場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: undefined }),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAdminFromCookie();

      expect(result).toBe(false);
    });

    test('空文字のroleはfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: '' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = isAdminFromCookie();

      expect(result).toBe(false);
    });
  });

  describe('Cookie取得例外の場合', () => {
    test('cookies()が例外をスローした場合はfalseを返す（Fail Secure）', () => {
      const testError = new Error('Server Component context error');
      mockCookies.mockImplementation(() => {
        throw testError;
      });

      const result = isAdminFromCookie();

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[isAdminFromCookie] Cookie取得エラー:',
        testError,
      );
    });
  });

  describe('cookies()の呼び出し', () => {
    test('roleという名前のcookieを取得する', () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'admin' });
      mockCookies.mockReturnValue({
        get: mockGet,
      } as unknown as ReturnType<typeof cookies>);

      isAdminFromCookie();

      expect(mockGet).toHaveBeenCalledWith('role');
    });
  });
});
