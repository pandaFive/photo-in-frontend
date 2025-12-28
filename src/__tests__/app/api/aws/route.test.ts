/**
 * AWS S3 Route Handler Tests
 * SEC-001: 認証チェックのテスト
 * @jest-environment node
 */

// S3 Sendモックへの参照（テスト間で変更可能）
let mockS3SendImpl: jest.Mock = jest.fn().mockResolvedValue({});

// AWS SDKのモック
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: (...args: unknown[]) => mockS3SendImpl(...args),
  })),
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

// 他のモジュールのモック
jest.mock('@/src/util/auth-headers');
jest.mock('@/src/api/post-task-create');

// モジュールインポート
import { NextRequest } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { GET, POST } from '@/src/app/api/aws/route';
import postTaskCreate from '@/src/api/post-task-create';
import { getAuthHeaders } from '@/src/util/auth-headers';

const mockGetAuthHeaders = getAuthHeaders as jest.MockedFunction<
  typeof getAuthHeaders
>;
const mockPostTaskCreate = postTaskCreate as jest.MockedFunction<
  typeof postTaskCreate
>;
const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;

describe('AWS S3 Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // S3 Sendモックをリセット
    mockS3SendImpl = jest.fn().mockResolvedValue({});
    mockGetSignedUrl.mockResolvedValue('https://s3.example.com/signed-url');
  });

  describe('GET /api/aws', () => {
    describe('認証チェック', () => {
      test('認証トークンがない場合は401を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({ ok: false, reason: 'no_token' });

        const request = new NextRequest(
          'http://localhost:3333/api/aws?key=test.pdf',
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.errors).toContain('認証が必要です');
      });

      test('認証トークンがある場合は正常に処理される', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const request = new NextRequest(
          'http://localhost:3333/api/aws?key=test.pdf',
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toBe('https://s3.example.com/signed-url');
      });
    });

    describe('バリデーション', () => {
      test('keyパラメータがない場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const request = new NextRequest('http://localhost:3333/api/aws');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors).toContain('Invalid or missing key parameter');
      });

      test('keyパラメータが空文字の場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const request = new NextRequest(
          'http://localhost:3333/api/aws?key=   ',
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors).toContain('Invalid or missing key parameter');
      });
    });

    describe('パストラバーサル対策', () => {
      test('keyに..が含まれる場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const request = new NextRequest(
          'http://localhost:3333/api/aws?key=../../../etc/passwd',
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors).toContain('Invalid key format');
      });

      test('keyが/で始まる場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const request = new NextRequest(
          'http://localhost:3333/api/aws?key=/absolute/path.pdf',
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors).toContain('Invalid key format');
      });

      test('keyに//が含まれる場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const request = new NextRequest(
          'http://localhost:3333/api/aws?key=path//to//file.pdf',
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors).toContain('Invalid key format');
      });
    });

    describe('エラーハンドリング', () => {
      test('署名URL生成に失敗した場合は500を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });
        mockGetSignedUrl.mockRejectedValue(new Error('S3 error'));

        const request = new NextRequest(
          'http://localhost:3333/api/aws?key=test.pdf',
        );
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.errors).toContain('Failed to generate signed URL');
      });
    });
  });

  describe('POST /api/aws', () => {
    // マジックバイト定義（ファイルタイプ検証用）
    const MAGIC_BYTES: Record<string, number[]> = {
      'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2D], // %PDF-
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    };

    // テスト用ファイル作成ヘルパー（マジックバイト付き）
    const createMockFile = (
      name: string,
      type: string,
      size: number,
    ): File => {
      const magicBytes = MAGIC_BYTES[type] || [];
      const paddingSize = Math.max(0, size - magicBytes.length);
      const content = new Uint8Array(magicBytes.length + paddingSize);
      content.set(magicBytes, 0);
      // 残りを 'a' (0x61) で埋める
      for (let i = magicBytes.length; i < content.length; i++) {
        content[i] = 0x61;
      }
      return new File([content], name, { type });
    };

    describe('認証チェック', () => {
      test('認証トークンがない場合は401を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({ ok: false, reason: 'no_token' });

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('test.pdf', 'application/pdf', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.errors).toContain('認証が必要です');
      });

      test('認証トークンがある場合は正常に処理される', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });
        mockPostTaskCreate.mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('test.pdf', 'application/pdf', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('url');
        expect(data).toHaveProperty('fileName');
      });
    });

    describe('バリデーション', () => {
      test('ファイルがない場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const formData = new FormData();

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors).toContain('No file provided');
      });

      test('ファイルサイズが制限を超える場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const formData = new FormData();
        // 11MBのファイル（制限は10MB）
        formData.append(
          'file',
          createMockFile('large.pdf', 'application/pdf', 11 * 1024 * 1024),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors[0]).toContain('File size exceeds limit');
      });

      test('許可されていないファイルタイプの場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('test.exe', 'application/x-msdownload', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors[0]).toContain('not allowed');
      });
    });

    describe('マジックバイト検証', () => {
      test('マジックバイトが一致しない場合は400を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });

        // PDFと偽ったJPEGファイル（マジックバイトはJPEG）
        const jpegMagicBytes = [0xFF, 0xD8, 0xFF];
        const content = new Uint8Array(100);
        content.set(jpegMagicBytes, 0);
        const spoofedFile = new File([content], 'fake.pdf', { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', spoofedFile);

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.errors[0]).toContain('ファイル内容が指定されたファイル形式と一致しません');
      });

      test('正しいマジックバイトのPDFは許可される', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });
        mockPostTaskCreate.mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('valid.pdf', 'application/pdf', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);

        expect(response.status).toBe(200);
      });
    });

    describe('ファイル名サニタイズ', () => {
      test('パストラバーサルパターンがサニタイズされる', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });
        mockPostTaskCreate.mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('../../../etc/passwd.pdf', 'application/pdf', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // ファイル名から..が除去されていることを確認
        expect(data.fileName).not.toContain('..');
      });

      test('危険な文字がサニタイズされる', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });
        mockPostTaskCreate.mockResolvedValue({ success: true });

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('test<script>alert.pdf', 'application/pdf', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // 危険な文字が除去されていることを確認
        expect(data.fileName).not.toContain('<');
        expect(data.fileName).not.toContain('>');
      });
    });

    describe('タスク作成エラー', () => {
      test('タスク作成に失敗した場合は500を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });
        mockPostTaskCreate.mockResolvedValue({
          errors: ['Task creation failed'],
        });

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('test.pdf', 'application/pdf', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.errors).toContain(
          'ファイルのアップロードは成功しましたが、タスクの作成に失敗しました',
        );
      });
    });

    describe('S3アップロードエラー', () => {
      test('S3アップロードに失敗した場合は500を返す', async () => {
        mockGetAuthHeaders.mockReturnValue({
          ok: true,
          headers: { Authorization: 'Bearer valid-token' },
        });
        // S3 sendをエラーに設定
        mockS3SendImpl = jest.fn().mockRejectedValue(new Error('S3 upload error'));

        const formData = new FormData();
        formData.append(
          'file',
          createMockFile('test.pdf', 'application/pdf', 100),
        );

        const request = new Request('http://localhost:3333/api/aws', {
          method: 'POST',
          body: formData,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.errors).toContain('Failed to upload file');
      });
    });
  });
});
