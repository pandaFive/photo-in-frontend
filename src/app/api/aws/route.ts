'use server';

import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

import postTaskCreate from '@/src/api/post-task-create';

export const POST = async (request: Request) => {
  const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY || '',
      secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
    },
  });

  const formData = await request.formData();
  const file = formData.get('file');
  const name = file.name;

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
