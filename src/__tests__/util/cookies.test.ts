import { cookies } from 'next/headers';

import { getCookies, setCookies, deleteCookie } from '@/src/util/cookies';

// next/headersのcookies関数をモック
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('cookies utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Date.nowをモック
    jest.spyOn(Date, 'now').mockReturnValue(1704067200000); // 2024-01-01 00:00:00 UTC
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCookies', () => {
    test('指定した名前のCookieの値を返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'test-value' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getCookies('token');

      expect(result).toBe('test-value');
    });

    test('Cookieが存在しない場合はundefinedを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ReturnType<typeof cookies>);

      const result = getCookies('nonexistent');

      expect(result).toBeUndefined();
    });

    test('正しい名前でCookieを取得する', () => {
      const mockGet = jest.fn().mockReturnValue({ value: 'value' });
      mockCookies.mockReturnValue({
        get: mockGet,
      } as unknown as ReturnType<typeof cookies>);

      getCookies('my-cookie');

      expect(mockGet).toHaveBeenCalledWith('my-cookie');
    });
  });

  describe('setCookies', () => {
    test('正しいオプションでCookieを設定する', () => {
      const mockSet = jest.fn();
      mockCookies.mockReturnValue({
        set: mockSet,
      } as unknown as ReturnType<typeof cookies>);

      setCookies('token', 'jwt-token-123');

      expect(mockSet).toHaveBeenCalledWith({
        name: 'token',
        value: 'jwt-token-123',
        expires: 1704067200000 + 24 * 60 * 60 * 1000, // 24時間後
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: false, // test環境ではNODE_ENV !== 'production'
      });
    });

    test('SEC-003: sameSite属性が"strict"に設定されている', () => {
      const mockSet = jest.fn();
      mockCookies.mockReturnValue({
        set: mockSet,
      } as unknown as ReturnType<typeof cookies>);

      setCookies('session', 'session-value');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          sameSite: 'strict',
        }),
      );
    });

    test('httpOnly属性がtrueに設定されている', () => {
      const mockSet = jest.fn();
      mockCookies.mockReturnValue({
        set: mockSet,
      } as unknown as ReturnType<typeof cookies>);

      setCookies('auth', 'auth-value');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          httpOnly: true,
        }),
      );
    });

    test('path属性が"/"に設定されている', () => {
      const mockSet = jest.fn();
      mockCookies.mockReturnValue({
        set: mockSet,
      } as unknown as ReturnType<typeof cookies>);

      setCookies('data', 'data-value');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/',
        }),
      );
    });

    test('有効期限が24時間後に設定される', () => {
      const mockSet = jest.fn();
      mockCookies.mockReturnValue({
        set: mockSet,
      } as unknown as ReturnType<typeof cookies>);

      setCookies('temp', 'temp-value');

      const expectedExpires = 1704067200000 + 24 * 60 * 60 * 1000;
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          expires: expectedExpires,
        }),
      );
    });

    describe('secure属性', () => {
      const originalEnv = process.env.NODE_ENV;

      afterEach(() => {
        process.env.NODE_ENV = originalEnv;
      });

      test('本番環境ではsecure属性がtrueになる', () => {
        process.env.NODE_ENV = 'production';
        const mockSet = jest.fn();
        mockCookies.mockReturnValue({
          set: mockSet,
        } as unknown as ReturnType<typeof cookies>);

        setCookies('secure-cookie', 'secure-value');

        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({
            secure: true,
          }),
        );
      });

      test('開発環境ではsecure属性がfalseになる', () => {
        process.env.NODE_ENV = 'development';
        const mockSet = jest.fn();
        mockCookies.mockReturnValue({
          set: mockSet,
        } as unknown as ReturnType<typeof cookies>);

        setCookies('dev-cookie', 'dev-value');

        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({
            secure: false,
          }),
        );
      });

      test('テスト環境ではsecure属性がfalseになる', () => {
        process.env.NODE_ENV = 'test';
        const mockSet = jest.fn();
        mockCookies.mockReturnValue({
          set: mockSet,
        } as unknown as ReturnType<typeof cookies>);

        setCookies('test-cookie', 'test-value');

        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({
            secure: false,
          }),
        );
      });
    });
  });

  describe('deleteCookie', () => {
    test('指定した名前のCookieを削除する', () => {
      const mockDelete = jest.fn();
      mockCookies.mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof cookies>);

      deleteCookie('token');

      expect(mockDelete).toHaveBeenCalledWith('token');
    });

    test('正しい名前でCookieを削除する', () => {
      const mockDelete = jest.fn();
      mockCookies.mockReturnValue({
        delete: mockDelete,
      } as unknown as ReturnType<typeof cookies>);

      deleteCookie('my-session');

      expect(mockDelete).toHaveBeenCalledWith('my-session');
    });
  });
});
