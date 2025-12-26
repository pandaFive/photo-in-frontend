import { cookies } from 'next/headers';

import { getAuthHeaders, getAuthHeadersUnsafe } from '@/src/util/auth-headers';

// next/headersのcookies関数をモック
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

// console.errorのモック
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('getAuthHeaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('トークンが存在する場合', () => {
    test('ok: trueとAuthorizationヘッダーを含むオブジェクトを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'test-token-123' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result).toEqual({
        ok: true,
        headers: { Authorization: 'Bearer test-token-123' },
      });
    });

    test('Bearer形式でトークンが設定される', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'jwt-token-xyz' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.headers.Authorization).toBe('Bearer jwt-token-xyz');
      }
    });

    test('トークンがある場合はエラーログを出力しない', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      } as unknown as ReturnType<typeof cookies>);

      getAuthHeaders();

      expect(mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('トークンが存在しない場合', () => {
    test('cookieが取得できない場合はok: falseとno_token reasonを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result).toEqual({ ok: false, reason: 'no_token' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[getAuthHeaders] 認証トークンが見つかりません - セッション期限切れの可能性',
      );
    });

    test('cookieのvalueがundefinedの場合はok: falseとno_token reasonを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: undefined }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      expect(result).toEqual({ ok: false, reason: 'no_token' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[getAuthHeaders] 認証トークンが見つかりません - セッション期限切れの可能性',
      );
    });
  });

  describe('空文字トークンの場合', () => {
    test('空文字のトークンはok: falseとno_token reasonを返す', () => {
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: '' }),
      } as unknown as ReturnType<typeof cookies>);

      const result = getAuthHeaders();

      // 空文字は falsy なのでno_tokenエラーを返す
      expect(result).toEqual({ ok: false, reason: 'no_token' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[getAuthHeaders] 認証トークンが見つかりません - セッション期限切れの可能性',
      );
    });
  });

  describe('Cookie取得例外の場合', () => {
    test('cookies()が例外をスローした場合はok: falseとcookie_error reasonを返す', () => {
      const testError = new Error('Server Component context error');
      mockCookies.mockImplementation(() => {
        throw testError;
      });

      const result = getAuthHeaders();

      expect(result).toEqual({ ok: false, reason: 'cookie_error' });
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[getAuthHeaders] Cookie取得エラー:',
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

      getAuthHeaders();

      expect(mockGet).toHaveBeenCalledWith('token');
    });
  });
});

describe('getAuthHeadersUnsafe（後方互換性）', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('トークンが存在する場合はAuthorizationヘッダーを含むオブジェクトを返す', () => {
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'test-token-123' }),
    } as unknown as ReturnType<typeof cookies>);

    const result = getAuthHeadersUnsafe();

    expect(result).toEqual({ Authorization: 'Bearer test-token-123' });
  });

  test('トークンが存在しない場合は空オブジェクトを返す', () => {
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ReturnType<typeof cookies>);

    const result = getAuthHeadersUnsafe();

    expect(result).toEqual({});
  });

  test('Cookie取得例外の場合は空オブジェクトを返す', () => {
    mockCookies.mockImplementation(() => {
      throw new Error('Server Component context error');
    });

    const result = getAuthHeadersUnsafe();

    expect(result).toEqual({});
  });
});
