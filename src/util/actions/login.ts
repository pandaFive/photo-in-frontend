'use server';
import { redirect, RedirectType } from 'next/navigation';

import { postLogin } from '@/src/api/post-login';

import { setCookies } from '../cookies';

export async function loginAction(formData: FormData) {
  const name = String(formData.get('name'));
  const password = String(formData.get('password'));

  const result = await postLogin(name, password);

  if ('token' in result) {
    setCookies('token', result.token);
    // SEC-006: 認可チェック用にロール情報をCookieに保存
    setCookies('role', result.role);
    if (result.role === 'admin') {
      redirect('/dashboard', RedirectType.push);
    } else {
      redirect(`/member/${result.id}`, RedirectType.push);
    }
  } else {
    redirect('/', RedirectType.push);
  }
}
