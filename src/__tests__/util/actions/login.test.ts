import { redirect, RedirectType } from 'next/navigation';

import { postLogin, Account } from '@/src/api/post-login';
import { ErrorResponse } from '@/src/types';
import { loginAction } from '@/src/util/actions/login';
import { setCookies } from '@/src/util/cookies';

// モック設定
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

jest.mock('@/src/api/post-login', () => ({
  postLogin: jest.fn(),
}));

jest.mock('@/src/util/cookies', () => ({
  setCookies: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockPostLogin = postLogin as jest.MockedFunction<typeof postLogin>;
const mockSetCookies = setCookies as jest.MockedFunction<typeof setCookies>;

describe('loginAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // FormDataのヘルパー関数
  const createFormData = (name: string, password: string): FormData => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('password', password);
    return formData;
  };

  describe('ログイン成功時', () => {
    test('管理者の場合、tokenとroleのCookieを設定し/dashboardにリダイレクトする', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'admin',
        token: 'jwt-token-admin',
        name: 'Admin User',
      };
      mockPostLogin.mockResolvedValue(mockAccount);

      const formData = createFormData('admin', 'password123');
      await loginAction(formData);

      // postLoginが正しい引数で呼ばれる
      expect(mockPostLogin).toHaveBeenCalledWith('admin', 'password123');

      // Cookieが設定される
      expect(mockSetCookies).toHaveBeenCalledWith('token', 'jwt-token-admin');
      expect(mockSetCookies).toHaveBeenCalledWith('role', 'admin');

      // /dashboardにリダイレクト
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard', RedirectType.push);
    });

    test('メンバーの場合、tokenとroleのCookieを設定し/member/{id}にリダイレクトする', async () => {
      const mockAccount: Account = {
        id: '42',
        role: 'member',
        token: 'jwt-token-member',
        name: 'Member User',
      };
      mockPostLogin.mockResolvedValue(mockAccount);

      const formData = createFormData('member', 'password456');
      await loginAction(formData);

      // postLoginが正しい引数で呼ばれる
      expect(mockPostLogin).toHaveBeenCalledWith('member', 'password456');

      // Cookieが設定される
      expect(mockSetCookies).toHaveBeenCalledWith('token', 'jwt-token-member');
      expect(mockSetCookies).toHaveBeenCalledWith('role', 'member');

      // /member/{id}にリダイレクト
      expect(mockRedirect).toHaveBeenCalledWith('/member/42', RedirectType.push);
    });

    test('SEC-006: ロール情報がCookieに保存される', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'admin',
        token: 'test-token',
        name: 'Test User',
      };
      mockPostLogin.mockResolvedValue(mockAccount);

      const formData = createFormData('test', 'test');
      await loginAction(formData);

      // role Cookieが設定されることを確認
      expect(mockSetCookies).toHaveBeenCalledWith('role', 'admin');
    });
  });

  describe('ログイン失敗時', () => {
    test('エラーメッセージ付きで/?error=にリダイレクトする', async () => {
      const mockError: ErrorResponse = {
        errors: ['ユーザー名またはパスワードが間違っています'],
      };
      mockPostLogin.mockResolvedValue(mockError);

      const formData = createFormData('wrong', 'credentials');
      await loginAction(formData);

      // Cookieは設定されない
      expect(mockSetCookies).not.toHaveBeenCalled();

      // エラーメッセージ付きでリダイレクト
      const expectedErrorMessage = encodeURIComponent('ユーザー名またはパスワードが間違っています');
      expect(mockRedirect).toHaveBeenCalledWith(
        `/?error=${expectedErrorMessage}`,
        RedirectType.push
      );
    });

    test('エラー配列が空の場合、デフォルトメッセージでリダイレクトする', async () => {
      const mockError: ErrorResponse = {
        errors: [],
      };
      mockPostLogin.mockResolvedValue(mockError);

      const formData = createFormData('user', 'pass');
      await loginAction(formData);

      // デフォルトエラーメッセージでリダイレクト
      const expectedErrorMessage = encodeURIComponent('ログインに失敗しました');
      expect(mockRedirect).toHaveBeenCalledWith(
        `/?error=${expectedErrorMessage}`,
        RedirectType.push
      );
    });

    test('特殊文字を含むエラーメッセージがエンコードされる', async () => {
      const mockError: ErrorResponse = {
        errors: ['エラー: ユーザー名に&記号は使えません'],
      };
      mockPostLogin.mockResolvedValue(mockError);

      const formData = createFormData('test&user', 'pass');
      await loginAction(formData);

      // エラーメッセージがURLエンコードされる
      const expectedErrorMessage = encodeURIComponent('エラー: ユーザー名に&記号は使えません');
      expect(mockRedirect).toHaveBeenCalledWith(
        `/?error=${expectedErrorMessage}`,
        RedirectType.push
      );
    });
  });

  describe('FormData処理', () => {
    test('FormDataからnameとpasswordを正しく取得する', async () => {
      const mockAccount: Account = {
        id: '1',
        role: 'member',
        token: 'token',
        name: 'User',
      };
      mockPostLogin.mockResolvedValue(mockAccount);

      const formData = createFormData('testuser', 'testpass');
      await loginAction(formData);

      expect(mockPostLogin).toHaveBeenCalledWith('testuser', 'testpass');
    });

    test('空のnameとpasswordでもpostLoginが呼ばれる', async () => {
      const mockError: ErrorResponse = {
        errors: ['入力が不正です'],
      };
      mockPostLogin.mockResolvedValue(mockError);

      const formData = createFormData('', '');
      await loginAction(formData);

      expect(mockPostLogin).toHaveBeenCalledWith('', '');
    });

    test('FormDataにフィールドがない場合、String(null)が渡される', async () => {
      const mockError: ErrorResponse = {
        errors: ['入力が不正です'],
      };
      mockPostLogin.mockResolvedValue(mockError);

      const formData = new FormData(); // フィールドなし
      await loginAction(formData);

      // String(null) = "null"
      expect(mockPostLogin).toHaveBeenCalledWith('null', 'null');
    });
  });

  describe('例外発生時', () => {
    test('postLoginが例外をスローした場合、例外が伝播する', async () => {
      mockPostLogin.mockRejectedValue(new Error('Network error'));

      const formData = createFormData('user', 'pass');

      await expect(loginAction(formData)).rejects.toThrow('Network error');

      // Cookieは設定されない
      expect(mockSetCookies).not.toHaveBeenCalled();
      // リダイレクトも実行されない
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    test('不明なロールの場合、/member/{id}にリダイレクトする', async () => {
      const mockAccount: Account = {
        id: '99',
        role: 'unknown_role',
        token: 'token',
        name: 'User',
      };
      mockPostLogin.mockResolvedValue(mockAccount);

      const formData = createFormData('user', 'pass');
      await loginAction(formData);

      // admin以外は全て/member/{id}にリダイレクト
      expect(mockRedirect).toHaveBeenCalledWith('/member/99', RedirectType.push);
    });

    test('複数のエラーメッセージがある場合、最初のメッセージのみ使用される', async () => {
      const mockError: ErrorResponse = {
        errors: ['エラー1', 'エラー2', 'エラー3'],
      };
      mockPostLogin.mockResolvedValue(mockError);

      const formData = createFormData('user', 'pass');
      await loginAction(formData);

      const expectedErrorMessage = encodeURIComponent('エラー1');
      expect(mockRedirect).toHaveBeenCalledWith(
        `/?error=${expectedErrorMessage}`,
        RedirectType.push
      );
    });
  });
});
