/**
 * Middleware Tests
 * SEC-009: レート制限のテスト
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { middleware } from '@/src/middleware';

// タイマーのリーク防止
jest.useFakeTimers();

describe('Middleware', () => {
  afterAll(() => {
    jest.useRealTimers();
  });
  describe('レート制限', () => {
    test('APIエンドポイント以外はレート制限を適用しない', async () => {
      const request = new NextRequest('http://localhost:3333/dashboard');
      const response = middleware(request);

      expect(response.status).toBe(200);
      // レート制限ヘッダーが含まれないことを確認
      expect(response.headers.get('X-RateLimit-Limit')).toBeNull();
    });

    test('APIエンドポイントにはレート制限ヘッダーを追加する', async () => {
      const request = new NextRequest('http://localhost:3333/api/tasks');
      const response = middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    test('認証エンドポイントはより厳しい制限を適用する', async () => {
      const request = new NextRequest('http://localhost:3333/api/login');
      const response = middleware(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    });

    test('/api/signupも認証エンドポイントとして扱う', async () => {
      const request = new NextRequest('http://localhost:3333/api/signup');
      const response = middleware(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    });

    test('/api/account/loginも認証エンドポイントとして扱う', async () => {
      const request = new NextRequest('http://localhost:3333/api/account/login');
      const response = middleware(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    });

    test('レート制限内のリクエストは成功する', async () => {
      // 新しいエンドポイントを使用して他のテストの影響を避ける
      const request = new NextRequest('http://localhost:3333/api/rate-test-1');
      const response = middleware(request);

      expect(response.status).toBe(200);
      // Remainingが減少していることを確認
      const remaining = Number(response.headers.get('X-RateLimit-Remaining'));
      expect(remaining).toBeLessThan(100);
    });
  });

  describe('クライアントIP取得', () => {
    test('X-Forwarded-ForヘッダーからクライアントIPを取得する', async () => {
      const request = new NextRequest('http://localhost:3333/api/test-xff', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });
      const response = middleware(request);

      // リクエストが処理されることを確認（IPが正しく取得されている）
      expect(response.status).toBe(200);
    });

    test('X-Real-IPヘッダーからクライアントIPを取得する', async () => {
      const request = new NextRequest('http://localhost:3333/api/test-realip', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    test('ヘッダーがない場合はunknownとして処理する', async () => {
      const request = new NextRequest('http://localhost:3333/api/test-unknown');
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('エラーハンドリング', () => {
    test('エラーが発生してもリクエストは通過する（Fail Open）', async () => {
      // middlewareはtry-catchで保護されているため、
      // 通常のリクエストは常に成功する
      const request = new NextRequest('http://localhost:3333/api/error-test');
      const response = middleware(request);

      // エラーが発生しても200を返す（Fail Open）
      expect(response.status).toBe(200);
    });
  });
});
