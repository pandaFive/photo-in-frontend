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
  // エリア情報のパース（JSON.parseはSyntaxErrorをスローする可能性がある）
  let area: string[];
  try {
    const areaString = formData.get('area');
    if (!areaString || typeof areaString !== 'string') {
      return { success: false, error: 'エリア情報が不正です' };
    }
    area = JSON.parse(areaString) as string[];
  } catch {
    return { success: false, error: 'エリア情報の形式が不正です' };
  }

  const capacity = formData.get('capacity');

  if (!(area instanceof Array) || capacity === null) {
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
