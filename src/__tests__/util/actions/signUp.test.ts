import { redirect, RedirectType } from 'next/navigation';

import { postSignup } from '@/src/api/post-signup';
import { AccountData, ErrorResponse } from '@/src/types';
import { singUpAction } from '@/src/util/actions/signUp';

// モック設定
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

jest.mock('@/src/api/post-signup', () => ({
  postSignup: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockPostSignup = postSignup as jest.MockedFunction<typeof postSignup>;

describe('singUpAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // FormDataのヘルパー関数
  const createFormData = (data: {
    name?: string;
    password?: string;
    area?: string;
    role?: string;
    capacity?: string;
  }): FormData => {
    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.password !== undefined) formData.append('password', data.password);
    if (data.area !== undefined) formData.append('area', data.area);
    if (data.role !== undefined) formData.append('role', data.role);
    if (data.capacity !== undefined) formData.append('capacity', data.capacity);
    return formData;
  };

  describe('サインアップ成功時', () => {
    test('アカウント作成成功時、/membersにリダイレクトする', async () => {
      const mockAccount: AccountData = {
        id: '1',
        name: 'Test User',
        role: 'member',
        capacity: 5,
        area: ['東京', '神奈川'],
      };
      mockPostSignup.mockResolvedValue(mockAccount);

      const formData = createFormData({
        name: 'newuser',
        password: 'password123',
        area: JSON.stringify(['東京', '神奈川']),
        role: 'member',
        capacity: '5',
      });

      await singUpAction(formData);

      // postSignupが正しい引数で呼ばれる
      expect(mockPostSignup).toHaveBeenCalledWith(
        'newuser',
        'password123',
        ['東京', '神奈川'],
        'member',
        5
      );

      // /membersにリダイレクト
      expect(mockRedirect).toHaveBeenCalledWith('/members', RedirectType.push);
    });

    test('管理者アカウント作成時も/membersにリダイレクトする', async () => {
      const mockAccount: AccountData = {
        id: '2',
        name: 'Admin User',
        role: 'admin',
        capacity: 10,
        area: ['全国'],
      };
      mockPostSignup.mockResolvedValue(mockAccount);

      const formData = createFormData({
        name: 'adminuser',
        password: 'adminpass',
        area: JSON.stringify(['全国']),
        role: 'admin',
        capacity: '10',
      });

      await singUpAction(formData);

      expect(mockRedirect).toHaveBeenCalledWith('/members', RedirectType.push);
    });
  });

  describe('サインアップ失敗時（APIエラー）', () => {
    test('エラーレスポンスの場合、success: falseとエラーメッセージを返す', async () => {
      const mockError: ErrorResponse = {
        errors: ['ユーザー名はすでに使用されています'],
      };
      mockPostSignup.mockResolvedValue(mockError);

      const formData = createFormData({
        name: 'existinguser',
        password: 'password',
        area: JSON.stringify(['東京']),
        role: 'member',
        capacity: '5',
      });

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'ユーザー名はすでに使用されています',
      });
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    test('エラー配列が空の場合、デフォルトメッセージを返す', async () => {
      const mockError: ErrorResponse = {
        errors: [],
      };
      mockPostSignup.mockResolvedValue(mockError);

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify(['東京']),
        role: 'member',
        capacity: '5',
      });

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'アカウント作成に失敗しました',
      });
    });

    test('複数のエラーがある場合、最初のエラーメッセージを使用する', async () => {
      const mockError: ErrorResponse = {
        errors: ['エラー1', 'エラー2', 'エラー3'],
      };
      mockPostSignup.mockResolvedValue(mockError);

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify(['東京']),
        role: 'member',
        capacity: '5',
      });

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'エラー1',
      });
    });
  });

  describe('エリア情報のバリデーション', () => {
    test('エリア情報がない場合、エラーを返す', async () => {
      const formData = createFormData({
        name: 'user',
        password: 'pass',
        role: 'member',
        capacity: '5',
        // areaなし
      });

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'エリア情報が不正です',
      });
      expect(mockPostSignup).not.toHaveBeenCalled();
    });

    test('エリア情報が不正なJSON形式の場合、エラーを返す', async () => {
      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: 'invalid json {',
        role: 'member',
        capacity: '5',
      });

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'エリア情報の形式が不正です',
      });
      expect(mockPostSignup).not.toHaveBeenCalled();
    });

    test('エリア情報が配列でない場合、エラーを返す', async () => {
      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify({ tokyo: true }), // オブジェクト
        role: 'member',
        capacity: '5',
      });

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: '入力データが不正です',
      });
      expect(mockPostSignup).not.toHaveBeenCalled();
    });

    test('エリア情報が文字列でない場合、エラーを返す', async () => {
      const formData = new FormData();
      formData.append('name', 'user');
      formData.append('password', 'pass');
      // Fileを追加（string以外）
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      formData.append('area', file);
      formData.append('role', 'member');
      formData.append('capacity', '5');

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: 'エリア情報が不正です',
      });
      expect(mockPostSignup).not.toHaveBeenCalled();
    });
  });

  describe('キャパシティのバリデーション', () => {
    test('キャパシティがない場合、エラーを返す', async () => {
      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify(['東京']),
        role: 'member',
        // capacityなし
      });

      const result = await singUpAction(formData);

      expect(result).toEqual({
        success: false,
        error: '入力データが不正です',
      });
      expect(mockPostSignup).not.toHaveBeenCalled();
    });
  });

  describe('例外発生時', () => {
    test('postSignupが例外をスローした場合、例外が伝播する', async () => {
      mockPostSignup.mockRejectedValue(new Error('Network error'));

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify(['東京']),
        role: 'member',
        capacity: '5',
      });

      await expect(singUpAction(formData)).rejects.toThrow('Network error');

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('FormData処理', () => {
    test('空の値でもpostSignupに渡される', async () => {
      const mockAccount: AccountData = {
        id: '1',
        name: '',
        role: '',
        capacity: 0,
        area: [],
      };
      mockPostSignup.mockResolvedValue(mockAccount);

      const formData = createFormData({
        name: '',
        password: '',
        area: JSON.stringify([]),
        role: '',
        capacity: '0',
      });

      await singUpAction(formData);

      expect(mockPostSignup).toHaveBeenCalledWith('', '', [], '', 0);
    });

    test('nameとpasswordフィールドがない場合、String(null)が渡される', async () => {
      const mockAccount: AccountData = {
        id: '1',
        name: 'null',
        role: 'null',
        capacity: NaN,
        area: ['東京'],
      };
      mockPostSignup.mockResolvedValue(mockAccount);

      const formData = new FormData();
      formData.append('area', JSON.stringify(['東京']));
      formData.append('capacity', '5');
      // name, password, roleなし

      await singUpAction(formData);

      // String(null) = "null", parseInt("null") = NaN
      expect(mockPostSignup).toHaveBeenCalledWith(
        'null',
        'null',
        ['東京'],
        'null',
        5
      );
    });
  });

  describe('エッジケース', () => {
    test('空の配列でもサインアップが成功する', async () => {
      const mockAccount: AccountData = {
        id: '1',
        name: 'User',
        role: 'member',
        capacity: 5,
        area: [],
      };
      mockPostSignup.mockResolvedValue(mockAccount);

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify([]),
        role: 'member',
        capacity: '5',
      });

      await singUpAction(formData);

      expect(mockPostSignup).toHaveBeenCalledWith('user', 'pass', [], 'member', 5);
      expect(mockRedirect).toHaveBeenCalledWith('/members', RedirectType.push);
    });

    test('キャパシティが数値でない場合、NaNが渡される', async () => {
      const mockAccount: AccountData = {
        id: '1',
        name: 'User',
        role: 'member',
        capacity: NaN,
        area: ['東京'],
      };
      mockPostSignup.mockResolvedValue(mockAccount);

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify(['東京']),
        role: 'member',
        capacity: 'abc',
      });

      await singUpAction(formData);

      // parseInt('abc') = NaN
      expect(mockPostSignup).toHaveBeenCalledWith(
        'user',
        'pass',
        ['東京'],
        'member',
        NaN
      );
    });

    test('特殊文字を含むエリア名でもサインアップが成功する', async () => {
      const mockAccount: AccountData = {
        id: '1',
        name: 'User',
        role: 'member',
        capacity: 5,
        area: ['東京都/渋谷区', '神奈川県&横浜市'],
      };
      mockPostSignup.mockResolvedValue(mockAccount);

      const formData = createFormData({
        name: 'user',
        password: 'pass',
        area: JSON.stringify(['東京都/渋谷区', '神奈川県&横浜市']),
        role: 'member',
        capacity: '5',
      });

      await singUpAction(formData);

      expect(mockPostSignup).toHaveBeenCalledWith(
        'user',
        'pass',
        ['東京都/渋谷区', '神奈川県&横浜市'],
        'member',
        5
      );
      expect(mockRedirect).toHaveBeenCalledWith('/members', RedirectType.push);
    });
  });
});
