'use server';

import { RedirectType, redirect } from 'next/navigation';

import { deleteCookie } from '../cookies';

export const logoutAction = () => {
  deleteCookie('token');
  // SEC-006対応: role Cookieも削除（ログイン時に設定されるため）
  deleteCookie('role');
  redirect('/', RedirectType.push);
};
