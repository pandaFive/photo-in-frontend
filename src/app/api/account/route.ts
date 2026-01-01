/**
 * Account API Route Handler
 *
 * PUT /api/account - メンバー情報更新
 */
import { NextRequest, NextResponse } from 'next/server';

import { MAX_CAPACITY, MAX_NAME_LENGTH } from '@/src/domain/constants/account';
import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { requireAdmin, requireAuth } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

type UpdateBody = {
  id: number;
  name: string;
  area: number[];
  capacity: number;
};

/**
 * 名前のバリデーション
 */
const validateName = (name: unknown): { valid: true } | { valid: false; error: string } => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { valid: false, error: '名前は必須です' };
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return { valid: false, error: '名前は32文字以内で入力してください' };
  }
  return { valid: true };
};

/**
 * IDのバリデーション
 */
const validateId = (id: unknown): { valid: true } | { valid: false; error: string } => {
  if (!id || typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    return { valid: false, error: '有効なアカウントIDが必要です' };
  }
  return { valid: true };
};

/**
 * エリア配列のバリデーション
 */
const validateAreaArray = (area: unknown): { valid: true } | { valid: false; error: string } => {
  if (!Array.isArray(area)) {
    return { valid: false, error: 'エリアは配列で指定してください' };
  }
  for (const areaId of area) {
    if (!Number.isInteger(areaId) || areaId <= 0) {
      return { valid: false, error: 'エリアIDは正の整数で指定してください' };
    }
  }
  return { valid: true };
};

/**
 * キャパシティのバリデーション
 */
const validateCapacity = (capacity: unknown): { valid: true } | { valid: false; error: string } => {
  if (!Number.isInteger(capacity) || (capacity as number) < 0 || (capacity as number) > MAX_CAPACITY) {
    return { valid: false, error: `1日の最大撮影数は0以上${MAX_CAPACITY}以下の整数で入力してください` };
  }
  return { valid: true };
};

/**
 * PUT /api/account - メンバー情報更新
 */
export const PUT = async (request: NextRequest) => {
  // 認証チェック
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  // 管理者権限チェック
  const adminResult = requireAdmin();
  if (!adminResult.ok) return adminResult.response;

  // リクエストボディのパース
  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch (parseError) {
    logError('[PUT] /api/account: JSON parse failed', parseError);
    return NextResponse.json(
      { errors: ['リクエストボディのJSON形式が不正です'] },
      { status: 400 },
    );
  }

  // ボディがnullまたはオブジェクトでない場合のガード
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { errors: ['リクエストボディはオブジェクト形式で指定してください'] },
      { status: 400 },
    );
  }

  // IDバリデーション
  const idResult = validateId(body.id);
  if (!idResult.valid) {
    return NextResponse.json({ errors: [idResult.error] }, { status: 400 });
  }

  // 名前バリデーション
  const nameResult = validateName(body.name);
  if (!nameResult.valid) {
    return NextResponse.json({ errors: [nameResult.error] }, { status: 400 });
  }

  // エリア配列バリデーション
  const areaResult = validateAreaArray(body.area);
  if (!areaResult.valid) {
    return NextResponse.json({ errors: [areaResult.error] }, { status: 400 });
  }

  // キャパシティバリデーション
  const capacityResult = validateCapacity(body.capacity);
  if (!capacityResult.valid) {
    return NextResponse.json({ errors: [capacityResult.error] }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/accounts/${body.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...auth.headers,
      },
      body: JSON.stringify({
        account: {
          name: body.name.trim(),
          area: body.area,
          capacity: body.capacity,
        },
      }),
    });

    if (res.ok) {
      try {
        const data: unknown = await res.json();
        return NextResponse.json(data, {
          headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
      } catch (jsonError) {
        logError('[PUT] /api/account: Success response JSON parse failed', jsonError);
        return NextResponse.json(
          { errors: ['サーバーからの応答を解析できませんでした'] },
          { status: 502 },
        );
      }
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[PUT] /api/account: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[PUT] /api/account', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
