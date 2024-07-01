'use server';
import { redirect, RedirectType } from 'next/navigation';

import { postLogin, Account } from '@/src/api/post-login';

import { setCookies } from '../cookies';

export async function loginAction(formData: FormData) {
  const result = await postLogin(
    String(formData.get('name')),
    String(formData.get('password')),
  );

  if ('account' in result) {
    const currentAccount: Account = result.account as Account;
    setCookies('token', currentAccount.token);
    if (currentAccount.role === 'admin') {
      redirect('dashboard', RedirectType.push);
    } else {
      redirect(`account/${currentAccount.id}`, RedirectType.push);
    }
  } else {
    redirect('dashboard');
  }
}
