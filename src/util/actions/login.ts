'use server';
import { redirect, RedirectType } from 'next/navigation';

import { postLogin } from '@/src/api/post-login';

import { setCookies } from '../cookies';

export async function loginAction(formData: FormData) {
  const result = await postLogin(
    String(formData.get('name')),
    String(formData.get('password')),
  );

  if ('account' in result) {
    setCookies('token', result.account.token as string);
    if (result.account.role === '0') {
      redirect('dashboard', RedirectType.push);
    } else {
      redirect(`account/${result.account.id}`, RedirectType.push);
    }
  } else {
    redirect('dashboard');
  }
}
