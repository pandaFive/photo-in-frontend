import { Result } from '@/src/domain/types/error';
import { serverHttpClient } from '@/src/infra/http';
import { ErrorResponse } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

import { postLogin, Account } from '@/src/api/post-login';

// モック設定
jest.mock('@/src/infra/http', () => ({
  serverHttpClient: {
    post: jest.fn(),
  },
}));

jest.mock('@/src/util/safe-logger', () => ({
  logError: jest.fn(),
}));

const mockPost = serverHttpClient.post as jest.MockedFunction<
  typeof serverHttpClient.post
>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

// 型定義
type LoginResponse = {
  account: Account;
};

describe('postLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ログイン成功時', () => {
    test('Accountオブジェクトを返す', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'admin',
        token: 'jwt-token-123',
        name: 'Test User',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('testuser', 'password123');

      expect(result).toEqual(mockAccount);
    });

    test('正しいエンドポイントとパラメータでAPIを呼び出す', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'member',
        token: 'token',
        name: 'User',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      await postLogin('myuser', 'mypassword');

      expect(mockPost).toHaveBeenCalledWith(
        '/account/login',
        { account: { name: 'myuser', password: 'mypassword' } },
        { cache: 'no-store' }
      );
    });

    test('成功時はlogErrorが呼ばれない', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'admin',
        token: 'token',
        name: 'User',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      await postLogin('user', 'pass');

      expect(mockLogError).not.toHaveBeenCalled();
    });

    test('管理者アカウントのレスポンスを正しく返す', async () => {
      const mockAccount: Account = {
        id: '42',
        role: 'admin',
        token: 'admin-jwt-token',
        name: 'Admin User',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('admin', 'adminpass');

      expect(result).toHaveProperty('id', '42');
      expect(result).toHaveProperty('role', 'admin');
      expect(result).toHaveProperty('token', 'admin-jwt-token');
      expect(result).toHaveProperty('name', 'Admin User');
    });

    test('メンバーアカウントのレスポンスを正しく返す', async () => {
      const mockAccount: Account = {
        id: '99',
        role: 'member',
        token: 'member-jwt-token',
        name: 'Member User',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('member', 'memberpass');

      expect(result).toHaveProperty('id', '99');
      expect(result).toHaveProperty('role', 'member');
    });
  });

  describe('ログイン失敗時（APIエラー）', () => {
    test('ErrorResponseを返す', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 401,
          message: 'ユーザー名またはパスワードが間違っています',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('wronguser', 'wrongpass');

      expect(result).toEqual({
        errors: ['ユーザー名またはパスワードが間違っています'],
      });
    });

    test('logErrorが呼ばれる', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 401,
          message: '認証エラー',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      await postLogin('user', 'pass');

      expect(mockLogError).toHaveBeenCalledWith('[postLogin]', '認証エラー');
    });

    test('400エラー時もErrorResponseを返す', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 400,
          message: '入力データが不正です',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('', '');

      expect(result).toEqual({
        errors: ['入力データが不正です'],
      });
    });

    test('500エラー時もErrorResponseを返す', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 500,
          message: 'サーバーエラーが発生しました',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('user', 'pass');

      expect(result).toEqual({
        errors: ['サーバーエラーが発生しました'],
      });
    });
  });

  describe('ネットワークエラー時', () => {
    test('ErrorResponseを返す', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'network',
          message: 'ネットワーク接続に失敗しました',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('user', 'pass');

      expect(result).toEqual({
        errors: ['ネットワーク接続に失敗しました'],
      });
    });

    test('logErrorが呼ばれる', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'network',
          message: 'タイムアウト',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      await postLogin('user', 'pass');

      expect(mockLogError).toHaveBeenCalledWith('[postLogin]', 'タイムアウト');
    });
  });

  describe('エッジケース', () => {
    test('空のユーザー名とパスワードでもAPIが呼ばれる', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 400,
          message: '入力が必要です',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      await postLogin('', '');

      expect(mockPost).toHaveBeenCalledWith(
        '/account/login',
        { account: { name: '', password: '' } },
        { cache: 'no-store' }
      );
    });

    test('特殊文字を含むユーザー名でもAPIが呼ばれる', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'member',
        token: 'token',
        name: 'user@example.com',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      await postLogin('user@example.com', 'pass&word=123');

      expect(mockPost).toHaveBeenCalledWith(
        '/account/login',
        { account: { name: 'user@example.com', password: 'pass&word=123' } },
        { cache: 'no-store' }
      );
    });

    test('日本語のユーザー名でもAPIが呼ばれる', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'member',
        token: 'token',
        name: '山田太郎',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      await postLogin('山田太郎', 'パスワード');

      expect(mockPost).toHaveBeenCalledWith(
        '/account/login',
        { account: { name: '山田太郎', password: 'パスワード' } },
        { cache: 'no-store' }
      );
    });
  });

  describe('型ガード', () => {
    test('成功レスポンスはerrors配列を持たない', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'admin',
        token: 'token',
        name: 'User',
      };
      const mockResult: Result<LoginResponse> = {
        ok: true,
        value: { account: mockAccount },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('user', 'pass');

      expect('errors' in result).toBe(false);
      expect('id' in result).toBe(true);
    });

    test('エラーレスポンスはid/role/token/nameを持たない', async () => {
      const mockResult: Result<LoginResponse> = {
        ok: false,
        error: {
          type: 'api',
          status: 401,
          message: 'エラー',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postLogin('user', 'pass');

      expect('errors' in result).toBe(true);
      expect('id' in result).toBe(false);
      expect('token' in result).toBe(false);
    });
  });
});
