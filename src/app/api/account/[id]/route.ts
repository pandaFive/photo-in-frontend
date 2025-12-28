'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { ResponseStatus } from '@/src/types';
import { isAdminFromCookie, isAuthenticated } from '@/src/util/auth-check';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { logError } from '@/src/util/safe-logger';
import { validateId } from '@/src/util/validation';

export const DELETE = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  // SEC-006: 認証チェック
  if (!isAuthenticated()) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  // SEC-006: 認可チェック（管理者のみ）
  if (!isAdminFromCookie()) {
    return NextResponse.json(
      { errors: ['この操作には管理者権限が必要です'] },
      { status: 403 },
    );
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
    const res = await fetch(`${process.env.API_HOST}/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        ...authResult.headers,
      },
    });

    if (res.ok) {
      const result: ResponseStatus = (await res.json()) as ResponseStatus;
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[DELETE] /api/account/[id]: res.text() failed', err);
        return '';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[DELETE] /api/account/[id]', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
