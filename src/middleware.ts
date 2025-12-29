import { NextRequest, NextResponse } from 'next/server';

import { logError } from '@/src/util/safe-logger';

/**
 * レート制限設定
 * SEC-009: APIエンドポイントへのレート制限
 */
const RATE_LIMIT_CONFIG = {
  // 時間ウィンドウ（ミリ秒）
  windowMs: 60 * 1000, // 1分
  // ウィンドウ内の最大リクエスト数
  maxRequests: 100,
  // 認証エンドポイントの最大リクエスト数（ブルートフォース対策）
  authMaxRequests: 10,
};

/**
 * インメモリレート制限ストア
 * 注意: 本番環境で複数インスタンスの場合はRedis等の共有ストアを使用すること
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * 古いエントリをクリーンアップ（メモリリーク防止）
 */
const cleanupStore = () => {
  try {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, value] of entries) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  } catch (error) {
    // クリーンアップ失敗時はログのみ（次回クリーンアップで再試行）
    logError('[Middleware:cleanupStore]', error);
  }
};

// 5分ごとにクリーンアップ
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupStore, 5 * 60 * 1000);
}

/**
 * クライアントIPを取得
 */
const getClientIp = (request: NextRequest): string => {
  // Cloudflare, AWS ALB, その他リバースプロキシのヘッダーを確認
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // 最初のIPがクライアントIP
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // フォールバック
  return 'unknown';
};

/**
 * レート制限チェック
 * @returns true = 制限超過, false = OK
 */
const isRateLimited = (
  clientId: string,
  maxRequests: number
): { limited: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  if (!record || record.resetTime < now) {
    // 新規または期限切れ：リセット
    const resetTime = now + RATE_LIMIT_CONFIG.windowMs;
    rateLimitStore.set(clientId, { count: 1, resetTime });
    return { limited: false, remaining: maxRequests - 1, resetTime };
  }

  // カウント増加
  record.count++;
  rateLimitStore.set(clientId, record);

  if (record.count > maxRequests) {
    return { limited: true, remaining: 0, resetTime: record.resetTime };
  }

  return {
    limited: false,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
};

/**
 * 認証エンドポイントかどうか判定
 */
const isAuthEndpoint = (pathname: string): boolean => {
  const authPaths = ['/api/login', '/api/signup', '/api/account/login'];
  return authPaths.some((path) => pathname.startsWith(path));
};

/**
 * Next.js Middleware
 * APIエンドポイントにレート制限を適用
 */
export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // APIエンドポイントのみ対象
    if (!pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    const clientIp = getClientIp(request);
    const isAuth = isAuthEndpoint(pathname);

    // 認証エンドポイントは厳しい制限
    const maxRequests = isAuth
      ? RATE_LIMIT_CONFIG.authMaxRequests
      : RATE_LIMIT_CONFIG.maxRequests;

    // レート制限キー（認証エンドポイントは別カウント）
    const rateLimitKey = isAuth ? `auth:${clientIp}` : `api:${clientIp}`;

    const { limited, remaining, resetTime } = isRateLimited(
      rateLimitKey,
      maxRequests
    );

    if (limited) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({
          errors: ['リクエスト数が上限を超えました。しばらく待ってから再試行してください。'],
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          },
        }
      );
    }

    // レスポンスにレート制限ヘッダーを追加
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

    return response;
  } catch (error) {
    // レート制限エラー時はリクエストを通す（Fail Open: 可用性優先）
    // セキュリティ優先の場合は500を返すよう変更可能
    logError('[Middleware:checkRateLimit]', error);
    return NextResponse.next();
  }
}

/**
 * Middleware適用対象のパス
 */
export const config = {
  matcher: '/api/:path*',
};
