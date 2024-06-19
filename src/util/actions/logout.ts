'use server';

import { RedirectType, redirect } from 'next/navigation';

import { deleteCookie } from '../cookies';

export const logoutAction = () => {
  deleteCookie('token');
  redirect('/login', RedirectType.push);
};
