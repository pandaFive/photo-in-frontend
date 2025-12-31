import { NextRequest, NextResponse } from 'next/server';

import { convertApiCommentToComment } from '@/src/domain/functions/converters';
import { CommentApiResponseSchema, CommentDeleteResponseSchema } from '@/src/domain/schemas';
import { parseErrorMessage } from '@/src/infra/http/serverClient';
import { CommentApiResponse } from '@/src/types/api-responses';
import { requireAuth, requireValidId } from '@/src/util/route-helpers';
import { logError } from '@/src/util/safe-logger';

type Body = {
  id: number;
  content: string;
  taskId: number;
};

export const POST = async (request: NextRequest) => {
  // DRY-M01: 認証チェック共通化
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

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

  try {
    const res = await fetch(`${process.env.API_HOST}/comments`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...auth.headers,
      },
      body: JSON.stringify({
        comment: {
          content: body.content,
          task_id: body.taskId,
        },
      }),
    });
    if (res.ok) {
      let apiComment: CommentApiResponse;
      try {
        const rawData: unknown = await res.json();
        // Zodバリデーション: バックエンドレスポンスの構造を検証
        const validationResult = CommentApiResponseSchema.safeParse(rawData);
        if (!validationResult.success) {
          logError(
            '[POST] /api/comment: バリデーション失敗',
            validationResult.error,
          );
          return NextResponse.json(
            { errors: ['バックエンドから不正なレスポンスを受信しました'] },
            { status: 502 },
          );
        }
        apiComment = validationResult.data;
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

      // snake_case → camelCase 変換
      const comment = convertApiCommentToComment(apiComment);
      return NextResponse.json(comment);
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
  // DRY-M01: 認証チェック共通化
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

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

  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${body.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...auth.headers,
      },
      body: JSON.stringify({
        comment: {
          id: body.id,
          content: body.content,
        },
      }),
    });
    if (res.ok) {
      let apiComment: CommentApiResponse;
      try {
        const rawData: unknown = await res.json();
        // Zodバリデーション: バックエンドレスポンスの構造を検証
        const validationResult = CommentApiResponseSchema.safeParse(rawData);
        if (!validationResult.success) {
          logError(
            '[PUT] /api/comment: バリデーション失敗',
            validationResult.error,
          );
          return NextResponse.json(
            { errors: ['バックエンドから不正なレスポンスを受信しました'] },
            { status: 502 },
          );
        }
        apiComment = validationResult.data;
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

      // snake_case → camelCase 変換
      const comment = convertApiCommentToComment(apiComment);
      return NextResponse.json(comment);
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
  // DRY-M01: 認証チェック共通化
  const auth = requireAuth();
  if (!auth.ok) return auth.response;

  const searchParams = request.nextUrl.searchParams;
  const commentIdParam = searchParams.get('commentId');

  // CODE-019: requireValidId()ヘルパーを使用（SEC-007バリデーション + ログ出力）
  const commentIdResult = requireValidId(commentIdParam ?? '');
  if (!commentIdResult.ok) return commentIdResult.response;
  const commentId = commentIdResult.id;

  try {
    const res = await fetch(`${process.env.API_HOST}/comments/${commentId}`, {
      method: 'DELETE',
      cache: 'no-store',
      headers: {
        ...auth.headers,
      },
    });

    if (res.ok) {
      try {
        const rawData: unknown = await res.json();
        // Zodバリデーション: バックエンドレスポンスの構造を検証
        const validationResult = CommentDeleteResponseSchema.safeParse(rawData);
        if (!validationResult.success) {
          logError(
            '[DELETE] /api/comment: バリデーション失敗',
            validationResult.error,
          );
          return NextResponse.json(
            { errors: ['バックエンドから不正なレスポンスを受信しました'] },
            { status: 502 },
          );
        }
        return NextResponse.json(validationResult.data);
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
