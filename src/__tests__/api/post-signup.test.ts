import { Result } from '@/src/domain/types/error';
import { serverHttpClient } from '@/src/infra/http';
import { AccountData } from '@/src/types';
import { logError } from '@/src/util/safe-logger';

import { postSignup } from '@/src/api/post-signup';

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

describe('postSignup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('サインアップ成功時', () => {
    test('AccountDataオブジェクトを返す', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: 'New User',
        area: ['東京', '神奈川'],
        role: 'member',
        token: 'jwt-token-123',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup(
        'newuser',
        'password123',
        ['東京', '神奈川'],
        'member',
        5
      );

      expect(result).toEqual(mockAccount);
    });

    test('正しいエンドポイントとパラメータでAPIを呼び出す', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: 'User',
        area: ['大阪'],
        role: 'admin',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('testuser', 'testpass', ['大阪'], 'admin', 10);

      expect(mockPost).toHaveBeenCalledWith(
        '/accounts',
        {
          account: {
            name: 'testuser',
            password: 'testpass',
            area: ['大阪'],
            role: 'admin',
            capacity: 10,
          },
        },
        { cache: 'no-store' }
      );
    });

    test('成功時はlogErrorが呼ばれない', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: 'User',
        area: [],
        role: 'member',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('user', 'pass', [], 'member', 5);

      expect(mockLogError).not.toHaveBeenCalled();
    });

    test('管理者アカウントの作成', async () => {
      const mockAccount: AccountData = {
        id: 42,
        name: 'Admin User',
        area: ['全国'],
        role: 'admin',
        token: 'admin-token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('admin', 'adminpass', ['全国'], 'admin', 100);

      expect(result).toHaveProperty('id', 42);
      expect(result).toHaveProperty('role', 'admin');
      expect(result).toHaveProperty('token', 'admin-token');
    });

    test('複数エリアを持つアカウントの作成', async () => {
      const areas = ['東京', '神奈川', '千葉', '埼玉'];
      const mockAccount: AccountData = {
        id: 1,
        name: 'User',
        area: areas,
        role: 'member',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('user', 'pass', areas, 'member', 5);

      expect(result).toHaveProperty('area', areas);
    });
  });

  describe('サインアップ失敗時（APIエラー）', () => {
    test('ErrorResponseを返す', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'api',
          status: 400,
          message: 'ユーザー名は既に使用されています',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('existinguser', 'pass', ['東京'], 'member', 5);

      expect(result).toEqual({
        errors: ['ユーザー名は既に使用されています'],
      });
    });

    test('logErrorが呼ばれる', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'api',
          status: 400,
          message: 'バリデーションエラー',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('user', 'pass', [], 'member', 5);

      expect(mockLogError).toHaveBeenCalledWith('[postSignup]', 'バリデーションエラー');
    });

    test('422エラー（バリデーションエラー）時もErrorResponseを返す', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'api',
          status: 422,
          message: 'パスワードが短すぎます',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('user', 'pw', ['東京'], 'member', 5);

      expect(result).toEqual({
        errors: ['パスワードが短すぎます'],
      });
    });

    test('500エラー時もErrorResponseを返す', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'api',
          status: 500,
          message: 'サーバーエラーが発生しました',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('user', 'pass', ['東京'], 'member', 5);

      expect(result).toEqual({
        errors: ['サーバーエラーが発生しました'],
      });
    });
  });

  describe('ネットワークエラー時', () => {
    test('ErrorResponseを返す', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'network',
          message: 'ネットワーク接続に失敗しました',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('user', 'pass', ['東京'], 'member', 5);

      expect(result).toEqual({
        errors: ['ネットワーク接続に失敗しました'],
      });
    });

    test('logErrorが呼ばれる', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'network',
          message: 'タイムアウト',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('user', 'pass', ['東京'], 'member', 5);

      expect(mockLogError).toHaveBeenCalledWith('[postSignup]', 'タイムアウト');
    });
  });

  describe('エッジケース', () => {
    test('空のエリア配列でもAPIが呼ばれる', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: 'User',
        area: [],
        role: 'member',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('user', 'pass', [], 'member', 5);

      expect(mockPost).toHaveBeenCalledWith(
        '/accounts',
        {
          account: {
            name: 'user',
            password: 'pass',
            area: [],
            role: 'member',
            capacity: 5,
          },
        },
        { cache: 'no-store' }
      );
    });

    test('キャパシティが0でもAPIが呼ばれる', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: 'User',
        area: ['東京'],
        role: 'member',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('user', 'pass', ['東京'], 'member', 0);

      expect(mockPost).toHaveBeenCalledWith(
        '/accounts',
        expect.objectContaining({
          account: expect.objectContaining({
            capacity: 0,
          }),
        }),
        { cache: 'no-store' }
      );
    });

    test('特殊文字を含むデータでもAPIが呼ばれる', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: 'user@example.com',
        area: ['東京都/渋谷区'],
        role: 'member',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('user@example.com', 'pass&word=123', ['東京都/渋谷区'], 'member', 5);

      expect(mockPost).toHaveBeenCalledWith(
        '/accounts',
        {
          account: {
            name: 'user@example.com',
            password: 'pass&word=123',
            area: ['東京都/渋谷区'],
            role: 'member',
            capacity: 5,
          },
        },
        { cache: 'no-store' }
      );
    });

    test('日本語のユーザー名でもAPIが呼ばれる', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: '山田太郎',
        area: ['東京'],
        role: 'member',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      await postSignup('山田太郎', 'パスワード', ['東京'], 'member', 5);

      expect(mockPost).toHaveBeenCalledWith(
        '/accounts',
        {
          account: {
            name: '山田太郎',
            password: 'パスワード',
            area: ['東京'],
            role: 'member',
            capacity: 5,
          },
        },
        { cache: 'no-store' }
      );
    });

    test('負のキャパシティでもAPIが呼ばれる（バリデーションはバックエンド）', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'api',
          status: 422,
          message: 'キャパシティは0以上である必要があります',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('user', 'pass', ['東京'], 'member', -5);

      expect(mockPost).toHaveBeenCalledWith(
        '/accounts',
        expect.objectContaining({
          account: expect.objectContaining({
            capacity: -5,
          }),
        }),
        { cache: 'no-store' }
      );
      expect(result).toEqual({
        errors: ['キャパシティは0以上である必要があります'],
      });
    });
  });

  describe('型ガード', () => {
    test('成功レスポンスはerrors配列を持たない', async () => {
      const mockAccount: AccountData = {
        id: 1,
        name: 'User',
        area: ['東京'],
        role: 'member',
        token: 'token',
      };
      const mockResult: Result<AccountData> = {
        ok: true,
        value: mockAccount,
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('user', 'pass', ['東京'], 'member', 5);

      expect('errors' in result).toBe(false);
      expect('id' in result).toBe(true);
      expect('token' in result).toBe(true);
    });

    test('エラーレスポンスはAccountDataのプロパティを持たない', async () => {
      const mockResult: Result<AccountData> = {
        ok: false,
        error: {
          type: 'api',
          status: 400,
          message: 'エラー',
        },
      };
      mockPost.mockResolvedValue(mockResult);

      const result = await postSignup('user', 'pass', ['東京'], 'member', 5);

      expect('errors' in result).toBe(true);
      expect('id' in result).toBe(false);
      expect('token' in result).toBe(false);
      expect('area' in result).toBe(false);
    });
  });
});
