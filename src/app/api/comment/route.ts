'use server';

import { NextRequest, NextResponse } from 'next/server';

import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { Comment, CommentApiResponse } from '@/src/types';
import { isAuthenticated } from '@/src/util/auth-check';
import { getAuthHeaders } from '@/src/util/auth-headers';
import { logError } from '@/src/util/safe-logger';
import { validateId } from '@/src/util/validation';

type Body = {
  id: number;
  content: string;
  taskId: number;
};

export const POST = async (request: NextRequest) => {
  // SEC-006: 認証チェック
  if (!isAuthenticated()) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { errors: ['リクエストボディのJSON形式が不正です'] },
      { status: 400 },
    );
  }

  // ボディバリデーション
  if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
    return NextResponse.json(
      { errors: ['コメント内容が必要です'] },
      { status: 400 },
    );
  }

  if (!body.taskId || !Number.isInteger(body.taskId) || body.taskId <= 0) {
    return NextResponse.json(
      { errors: ['有効なタスクIDが必要です'] },
      { status: 400 },
    );
  }

  // 認証ヘッダー取得
  const authResult = getAuthHeaders();
  if (!authResult.ok) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/comments`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...authResult.headers,
      },
      body: JSON.stringify({
        comment: {
          content: body.content,
          task_id: body.taskId,
        },
      }),
    });
    if (res.ok) {
      let result: Comment;
      try {
        result = (await res.json()) as Comment;
      } catch (jsonErr) {
        logError(
          `[POST] /api/comment: res.json() failed (content-type: ${res.headers.get('content-type')})`,
          jsonErr,
        );
        return NextResponse.json(
          { errors: ['バックエンドから不正なレスポンスを受信しました'] },
          { status: 502 },
        );
      }
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[POST] /api/comment: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[POST] /api/comment', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};

export const PUT = async (request: NextRequest) => {
  // SEC-006: 認証チェック
  if (!isAuthenticated()) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { errors: ['リクエストボディのJSON形式が不正です'] },
      { status: 400 },
    );
  }

  // ボディバリデーション
  if (!body.id || !Number.isInteger(body.id) || body.id <= 0) {
    return NextResponse.json(
      { errors: ['有効なコメントIDが必要です'] },
      { status: 400 },
    );
  }

  if (!body.content || typeof body.content !== 'string' || body.content.trim() === '') {
    return NextResponse.json(
      { errors: ['コメント内容が必要です'] },
      { status: 400 },
    );
  }

  // 認証ヘッダー取得
  const authResult = getAuthHeaders();
  if (!authResult.ok) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${body.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...authResult.headers,
      },
      body: JSON.stringify({
        comment: {
          id: body.id,
          content: body.content,
        },
      }),
    });
    if (res.ok) {
      let result: Comment;
      try {
        result = (await res.json()) as Comment;
      } catch (jsonErr) {
        logError(
          `[PUT] /api/comment: res.json() failed (content-type: ${res.headers.get('content-type')})`,
          jsonErr,
        );
        return NextResponse.json(
          { errors: ['バックエンドから不正なレスポンスを受信しました'] },
          { status: 502 },
        );
      }
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[PUT] /api/comment: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[PUT] /api/comment', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};

export const DELETE = async (request: NextRequest) => {
  // SEC-006: 認証チェック
  if (!isAuthenticated()) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const commentIdParam = searchParams.get('commentId');

  // SEC-007: IDバリデーション（バウンドチェック含む）
  const commentIdResult = validateId(commentIdParam);
  if (!commentIdResult.valid) {
    return NextResponse.json(
      { errors: [commentIdResult.error] },
      { status: 400 },
    );
  }
  const commentId = commentIdResult.id;

  // 認証ヘッダー取得
  const authResult = getAuthHeaders();
  if (!authResult.ok) {
    return NextResponse.json({ errors: ['認証が必要です'] }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${commentId}`, {
      method: 'DELETE',
      cache: 'no-store',
      headers: {
        ...authResult.headers,
      },
    });

    if (res.ok) {
      let result: CommentApiResponse;
      try {
        result = (await res.json()) as CommentApiResponse;
      } catch (jsonErr) {
        logError(
          `[DELETE] /api/comment: res.json() failed (content-type: ${res.headers.get('content-type')})`,
          jsonErr,
        );
        return NextResponse.json(
          { errors: ['バックエンドから不正なレスポンスを受信しました'] },
          { status: 502 },
        );
      }
      return NextResponse.json(result);
    } else {
      const errorText = await res.text().catch((err) => {
        logError('[DELETE] /api/comment: res.text() failed', err);
        return 'レスポンスボディの読み取りに失敗しました';
      });
      return NextResponse.json({ errors: [parseErrorMessage(errorText)] }, { status: res.status });
    }
  } catch (err) {
    logError('[DELETE] /api/comment', err);
    return NextResponse.json({ errors: ['サーバーエラーが発生しました'] }, { status: 500 });
  }
};
