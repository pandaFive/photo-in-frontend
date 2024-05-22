'use server';

import { RedirectType, redirect } from 'next/navigation';

import { deleteCookie } from '../cookies';

export const logoutAction = () => {
  console.log('check');
  deleteCookie('token');
  redirect('/login', RedirectType.push);
};
