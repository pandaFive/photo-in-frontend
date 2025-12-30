import bundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */

/**
 * OPT-001: バンドル分析設定
 * npm run build:analyze または ANALYZE=true npm run build でバンドルサイズを可視化
 */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * SEC-012: Content Security Policy (CSP) 設定
 *
 * ディレクティブ解説:
 * - default-src 'self': 明示されていないリソースはselfのみ許可
 * - script-src: Next.jsのインラインスクリプト（hydration）に'unsafe-inline'が必要
 *               開発環境のHMRには'unsafe-eval'が必要（本番では除外）
 * - style-src: MUI (Emotion) がインラインスタイルを使用するため'unsafe-inline'が必要
 * - img-src: self + data URI + blob URL + S3プリサインドURL（バケット指定）
 * - font-src: next/font/googleはローカル配信のため'self'のみ
 * - connect-src: self（BFF経由API）+ S3プリサインドURL（バケット指定）
 * - worker-src 'self': Web Worker/Service Workerのソース制限
 * - object-src 'none': プラグイン（Flash等）を完全ブロック
 * - frame-ancestors 'none': X-Frame-Options: DENYと同等（クリックジャッキング対策）
 * - base-uri 'self': base要素によるURL改ざん防止
 * - form-action 'self': フォーム送信先を制限
 * - upgrade-insecure-requests: HTTPリクエストをHTTPSにアップグレード
 *
 * 将来の改善: nonce-based CSPへの移行で'unsafe-inline'を排除
 */

// 環境に応じたCSP設定
const isDev = process.env.NODE_ENV === 'development';

// S3バケットドメイン（環境変数から取得、未設定時はリージョン指定のワイルドカード）
// 本番環境では NEXT_PUBLIC_S3_BUCKET_DOMAIN に具体的なバケットドメインを設定すること
const s3BucketDomain = process.env.NEXT_PUBLIC_S3_BUCKET_DOMAIN || '*.s3.ap-northeast-1.amazonaws.com';

// script-src: 開発環境のみ'unsafe-eval'を許可（HMR用）
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const cspDirectives = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${s3BucketDomain}`,
  "font-src 'self'",
  `connect-src 'self' https://${s3BucketDomain}`,
  "worker-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
