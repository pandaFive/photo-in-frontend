'use server';

import { redirect, RedirectType } from 'next/navigation';

import { postSignup } from '@/src/api/post-signup';
import { isErrorResponse } from '@/src/types';

// ERR-004: エラー時にエラーメッセージを返すように変更
export type SignUpResult = {
  success: boolean;
  error?: string;
};

export const singUpAction = async (formData: FormData): Promise<SignUpResult> => {
  const area = JSON.parse(formData.get('area') as string) as string[];
  const capacity = formData.get('capacity');

  if (area === null || !(area instanceof Array) || capacity === null) {
    return { success: false, error: '入力データが不正です' };
  }

  const result = await postSignup(
    String(formData.get('name')),
    String(formData.get('password')),
    area,
    String(formData.get('role')),
    parseInt(String(capacity)),
  );

  if (isErrorResponse(result)) {
    return { success: false, error: result.errors[0] || 'アカウント作成に失敗しました' };
  }

  // 成功時はリダイレクト
  redirect('/members', RedirectType.push);
};
