import { S3Client } from '@aws-sdk/client-s3';
import React, { useState } from 'react';

const UploadTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // S3の設定
  const s3Client = new S3Client({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  // ファイルをアップロードする関数
  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);

    // ファイルのアップロードパラメータ
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.name,
      Body: file,
    };

    try {
      await s3.upload(params).promise();
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  // ファイルが選択されたときのハンドラー
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div>
      <input onChange={handleFileChange} type="file" />
      <button disabled={uploading} onClick={uploadFile}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default UploadTest;
