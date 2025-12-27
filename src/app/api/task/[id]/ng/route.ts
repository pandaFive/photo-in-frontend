'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { isAuthenticated } from '@/src/util/auth-check';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { logError } from '@/src/util/safe-logger';
import { validateId } from '@/src/util/validation';

type Result = {
  message: string;
  result: boolean;
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  // SEC-006: 認証チェック
  if (!isAuthenticated()) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  // SEC-007: IDバリデーション（バウンドチェック含む）
  const idResult = validateId(params.id);
  if (!idResult.valid) {
    return NextResponse.json({ errors: [idResult.error] }, { status: 400 });
  }
  const id = idResult.id;

  // 認証ヘッダー取得
  const authResult = getAuthHeaders();
  if (!authResult.ok) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/tasks/${id}/ng`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        ...authResult.headers,
      },
    });

    if (res.ok) {
      const result: Result = (await res.json()) as Result;
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch(() => '');
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[PUT] /api/task/[id]/ng', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
