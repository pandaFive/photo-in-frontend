/**
 * Area API Route Handler
 *
 * POST /api/area - エリア新規作成
 * PUT /api/area - エリア更新
 */
import { NextRequest, NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { requireAdmin, requireAuth } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

/** エリア名の最大文字数 */
const MAX_NAME_LENGTH = 32;

type CreateBody = {
  name: string;
};

type UpdateBody = {
  id: number;
  name: string;
};

/**
 * エリア名のバリデーション
 */
const validateAreaName = (name: unknown): { valid: true } | { valid: false; error: string } => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { valid: false, error: 'エリア名は必須です' };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: 'エリア名は32文字以内で入力してください' };
  }
  return { valid: true };
};

/**
 * POST /api/area - エリア新規作成
 */
export const POST = async (request: NextRequest) => {
  // 認証チェック
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  // 管理者権限チェック
  const adminResult = requireAdmin();
  if (!adminResult.ok) return adminResult.response;

  // リクエストボディのパース
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json(
      { errors: ['リクエストボディのJSON形式が不正です'] },
      { status: 400 },
    );
  }

  // エリア名バリデーション
  const nameResult = validateAreaName(body.name);
  if (!nameResult.valid) {
    return NextResponse.json({ errors: [nameResult.error] }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/areas`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...auth.headers,
      },
      body: JSON.stringify({
        area: { name: body.name.trim() },
      }),
    });

    if (res.ok) {
      const data: unknown = await res.json();
      return NextResponse.json(data);
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[POST] /api/area: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[POST] /api/area', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};

/**
 * PUT /api/area - エリア更新
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
  } catch {
    return NextResponse.json(
      { errors: ['リクエストボディのJSON形式が不正です'] },
      { status: 400 },
    );
  }

  // IDバリデーション
  if (!body.id || !Number.isInteger(body.id) || body.id <= 0) {
    return NextResponse.json({ errors: ['有効なエリアIDが必要です'] }, { status: 400 });
  }

  // エリア名バリデーション
  const nameResult = validateAreaName(body.name);
  if (!nameResult.valid) {
    return NextResponse.json({ errors: [nameResult.error] }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/areas/${body.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...auth.headers,
      },
      body: JSON.stringify({
        area: { name: body.name.trim() },
      }),
    });

    if (res.ok) {
      const data: unknown = await res.json();
      return NextResponse.json(data);
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[PUT] /api/area: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[PUT] /api/area', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
