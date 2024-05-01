'use server';

import upload from '@/src/api/aws/post-file';
import postTaskCreate from '@/src/api/post-task-create';

const uploadAction = async (formData: FormData) => {
  // const uploadAction = async (files: File[]) => {
  const files = formData.get('files');
  const result = await upload(files);

  if ('ETag' in result) {
    await postTaskCreate(files[0].name);
  } else {
    console.error('Upload failed');
  }
};

export default uploadAction;
