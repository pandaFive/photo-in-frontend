'use server';

import { NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Area } from '@/src/types';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { logError } from '@/src/util/safe-logger';

export const GET = async () => {
  // 認証ヘッダー取得
  const authResult = getAuthHeaders();
  if (!authResult.ok) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/areas`, {
      method: 'GET',
      headers: {
        ...authResult.headers,
      },
    });
    if (res.ok) {
      let result: Area[];
      try {
        result = (await res.json()) as Area[];
      } catch (jsonErr) {
        logError('[GET] /api/areas: res.json() failed', jsonErr);
        return NextResponse.json(
          { errors: ['バックエンドから不正なレスポンスを受信しました'] },
          { status: 502 },
        );
      }
      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      });
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[GET] /api/areas: res.text() failed', err);
        return '';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[GET] /api/areas', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
