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

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
  },
});

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');

  const getParams: GetObjectCommandInput = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  const command = new GetObjectCommand(getParams);

  try {
    // @ts-expect-error don't resolve error
    const url = await getSignedUrl(s3Client, command, { expiresIn: 7200 });
    console.log('Get success:', url);
    return NextResponse.json(url);
  } catch (err) {
    console.error(err);
    return NextResponse.json(err);
  }
};

export const POST = async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get('file');
  const name = file in name ? (file.name as string) : '';

  const buffer = Buffer.from(await file?.arrayBuffer());

  const uploadParams: PutObjectCommandInput = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: name,
    Body: buffer,
    ContentType: 'application/pdf',
    ACL: 'public-read',
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    const uploadResult = await s3Client.send(command);
    console.log('Upload success:', uploadResult);
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${name}`;
    await postTaskCreate(name);
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(err);
  }
};
