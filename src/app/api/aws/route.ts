'use server';

import {
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

import postTaskCreate from '@/src/api/post-task-create';
import { isErrorResponse } from '@/src/types';

// 定数定義
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SIGNED_URL_EXPIRATION = 7200; // 2時間（秒）

// 環境変数の検証
if (!process.env.REGION || !process.env.ACCESS_KEY || !process.env.SECRET_ACCESS_KEY || !process.env.S3_BUCKET_NAME) {
  throw new Error('Required AWS environment variables are not set');
}

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');

  // キーのバリデーション
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return NextResponse.json(
      { error: 'Invalid or missing key parameter' },
      { status: 400 }
    );
  }

  const getParams: GetObjectCommandInput = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  const command = new GetObjectCommand(getParams);

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: SIGNED_URL_EXPIRATION });
    return NextResponse.json(url);
  } catch (err) {
    console.error('Failed to generate signed URL:', err);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // ファイルの存在チェック
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // ファイルサイズのバリデーション
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // ファイルタイプのバリデーション
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const name: string = file.name || `upload-${Date.now()}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: name,
      Body: buffer,
      ContentType: file.type,
      // ACL: 'public-read' を削除 - デフォルトでプライベートになる
      // アクセスが必要な場合は署名付きURLを使用
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // タスク作成
    const taskResult = await postTaskCreate(name);
    if (isErrorResponse(taskResult)) {
      console.error('Task creation failed:', taskResult.errors);
      // タスク作成失敗してもファイルアップロードは成功しているので続行
    }

    // 署名付きURLを生成してアクセス可能にする
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: name,
    });
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: SIGNED_URL_EXPIRATION });

    return NextResponse.json({ url, fileName: name });
  } catch (err) {
    console.error('Upload failed:', err);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
};
