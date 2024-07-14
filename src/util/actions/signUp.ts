'use server';

import { redirect, RedirectType } from 'next/navigation';

import { postSignup } from '@/src/api/post-signup';

export const singUpAction = async (formData: FormData) => {
  const area = JSON.parse(formData.get('area') as string) as string[];
  const capacity = formData.get('capacity');
  if (area !== null && area instanceof Array && capacity !== null) {
    const result = await postSignup(
      String(formData.get('name')),
      String(formData.get('password')),
      area,
      String(formData.get('role')),
      parseInt(String(capacity)),
    );

    if ('account' in result) {
      redirect('/members', RedirectType.push);
    }
  }
};
