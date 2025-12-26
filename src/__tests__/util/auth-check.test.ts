import { isAuthenticated, isAdminFromCookie } from '@/src/util/auth-check';
import { cookies } from 'next/headers';

// next/headersのモック
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('auth-check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated function', () => {
    it('トークンが存在する場合はtrueを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn((name: string) => {
          if (name === 'token') {
            return { name: 'token', value: 'valid-token' };
          }
          return undefined;
        }),
      } as unknown as ReturnType<typeof cookies>);

      expect(isAuthenticated()).toBe(true);
    });

    it('トークンが存在しない場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn(() => undefined),
      } as unknown as ReturnType<typeof cookies>);

      expect(isAuthenticated()).toBe(false);
    });

    it('トークンが空文字の場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn((name: string) => {
          if (name === 'token') {
            return { name: 'token', value: '' };
          }
          return undefined;
        }),
      } as unknown as ReturnType<typeof cookies>);

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('isAdminFromCookie function', () => {
    it('roleが"admin"の場合はtrueを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn((name: string) => {
          if (name === 'role') {
            return { name: 'role', value: 'admin' };
          }
          return undefined;
        }),
      } as unknown as ReturnType<typeof cookies>);

      expect(isAdminFromCookie()).toBe(true);
    });

    it('roleが"member"の場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn((name: string) => {
          if (name === 'role') {
            return { name: 'role', value: 'member' };
          }
          return undefined;
        }),
      } as unknown as ReturnType<typeof cookies>);

      expect(isAdminFromCookie()).toBe(false);
    });

    it('roleが存在しない場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn(() => undefined),
      } as unknown as ReturnType<typeof cookies>);

      expect(isAdminFromCookie()).toBe(false);
    });

    it('roleが空文字の場合はfalseを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn((name: string) => {
          if (name === 'role') {
            return { name: 'role', value: '' };
          }
          return undefined;
        }),
      } as unknown as ReturnType<typeof cookies>);

      expect(isAdminFromCookie()).toBe(false);
    });
  });
});
