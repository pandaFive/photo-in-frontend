'use server';
import { redirect } from 'next/navigation';

import { postLogin } from '@/src/api/post-login';

import { setCookies } from '../cookies';

export async function loginAction(formData: FormData) {
  const result = await postLogin(
    String(formData.get('name')),
    String(formData.get('password')),
  );

  if ('account' in result) {
    setCookies('token', result.account.token as string);
    if (result.role === '0') {
      redirect('dashboard');
    } else {
      redirect(`account/${result.id}`);
    }
  } else {
    redirect('dashboard');
  }
}
