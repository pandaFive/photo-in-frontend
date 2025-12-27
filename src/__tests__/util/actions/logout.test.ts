import { redirect, RedirectType } from 'next/navigation';

import { logoutAction } from '@/src/util/actions/logout';
import { deleteCookie } from '@/src/util/cookies';

// モック設定
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

jest.mock('@/src/util/cookies', () => ({
  deleteCookie: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockDeleteCookie = deleteCookie as jest.MockedFunction<typeof deleteCookie>;

describe('logoutAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('tokenクッキーを削除する', () => {
    logoutAction();

    expect(mockDeleteCookie).toHaveBeenCalledWith('token');
  });

  test('SEC-006: roleクッキーを削除する', () => {
    logoutAction();

    expect(mockDeleteCookie).toHaveBeenCalledWith('role');
  });

  test('ルートパス（/）にリダイレクトする', () => {
    logoutAction();

    expect(mockRedirect).toHaveBeenCalledWith('/', RedirectType.push);
  });

  test('削除後にリダイレクトが実行される（呼び出し順序）', () => {
    // 呼び出し順序を確認
    const callOrder: string[] = [];

    mockDeleteCookie.mockImplementation(() => {
      callOrder.push('deleteCookie');
    });
    mockRedirect.mockImplementation(() => {
      callOrder.push('redirect');
    });

    logoutAction();

    // deleteCookieが2回呼ばれた後にredirectが呼ばれる
    expect(callOrder).toEqual(['deleteCookie', 'deleteCookie', 'redirect']);
  });

  test('deleteCookieが2回呼ばれる（tokenとrole）', () => {
    logoutAction();

    expect(mockDeleteCookie).toHaveBeenCalledTimes(2);
  });

  test('redirectが1回だけ呼ばれる', () => {
    logoutAction();

    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});
