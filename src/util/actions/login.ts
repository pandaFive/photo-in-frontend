'use server';
import { redirect, RedirectType } from 'next/navigation';

import { postLogin } from '@/src/api/post-login';

import { setCookies } from '../cookies';

// ERR-003: エラー時にクエリパラメータでエラーメッセージを渡す
export async function loginAction(formData: FormData) {
  const name = String(formData.get('name'));
  const password = String(formData.get('password'));

  const result = await postLogin(name, password);

  // postLoginの戻り値はAccount | ErrorResponseの判別共用体
  if ('token' in result) {
    // Account: ログイン成功
    setCookies('token', result.token);
    // SEC-006: 認可チェック用にロール情報をCookieに保存
    setCookies('role', result.role);
    if (result.role === 'admin') {
      redirect('/dashboard', RedirectType.push);
    } else {
      redirect(`/member/${result.id}`, RedirectType.push);
    }
  } else {
    // ErrorResponse: ログイン失敗
    const errorMessage = encodeURIComponent(result.errors[0] || 'ログインに失敗しました');
    redirect(`/?error=${errorMessage}`, RedirectType.push);
  }
}
