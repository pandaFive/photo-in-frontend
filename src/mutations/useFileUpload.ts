import { useCallback, useState } from 'react';

import { httpClient } from '@/src/infra/http';
import { logError, logWarn } from '@/src/util/safe-logger';

// ファイルアップロードのバリデーション設定
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

/**
 * TYPE-004: アップロード結果型（判別共用体）
 * 不正な状態（success: true かつ error が存在）を型レベルで防止
 */
type UploadResult =
  | { success: true }
  | { success: false; error: string };

/**
 * TYPE-003: バリデーション結果型（判別共用体）
 * 不正な状態（valid: true かつ error が存在）を型レベルで防止
 */
type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * ファイルのバリデーションを実行
 * @param file - バリデーション対象のファイル
 * @returns バリデーション結果
 */
const validateFile = (file: File): ValidationResult => {
  // MIMEタイプチェック
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    logWarn('[useFileUpload]', `Invalid MIME type: ${file.type} for file: ${file.name}`);
    return {
      valid: false,
      error: `「${file.name}」は許可されていないファイル形式です。PDFファイルのみアップロード可能です。`,
    };
  }

  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    logWarn('[useFileUpload]', `File too large: ${sizeMB}MB for file: ${file.name}`);
    return {
      valid: false,
      error: `「${file.name}」のサイズ（${sizeMB}MB）が上限（100MB）を超えています。`,
    };
  }

  return { valid: true };
};

/**
 * 複数ファイルのバリデーションを実行
 * @param files - バリデーション対象のファイル配列
 * @returns バリデーション結果（最初のエラーで停止）
 */
const validateFiles = (files: File[]): ValidationResult => {
  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};

type UploadProgress = {
  isUploading: boolean;
  currentFile: string | null;
  uploadedCount: number;
  totalCount: number;
};

/**
 * ファイルアップロード用のmutation hook
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState<UploadProgress>({
    isUploading: false,
    currentFile: null,
    uploadedCount: 0,
    totalCount: 0,
  });

  /**
   * 複数ファイルをアップロード
   * アップロード前にファイルサイズとMIMEタイプのバリデーションを実行
   */
  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadResult> => {
      if (files.length === 0) {
        return { success: false, error: 'ファイルが選択されていません' };
      }

      // ファイルバリデーション（サイズ・MIMEタイプチェック）
      const validationResult = validateFiles(files);
      if (!validationResult.valid) {
        return { success: false, error: validationResult.error };
      }

      setProgress({
        isUploading: true,
        currentFile: null,
        uploadedCount: 0,
        totalCount: files.length,
      });

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setProgress((prev) => ({
            ...prev,
            currentFile: file.name,
            uploadedCount: i,
          }));

          const formData = new FormData();
          formData.append('file', file);

          const result = await httpClient.postFormData('/api/aws', formData);

          if (!result.ok) {
            throw new Error(
              `Failed to upload ${file.name}: ${result.error.message}`,
            );
          }
        }

        setProgress({
          isUploading: false,
          currentFile: null,
          uploadedCount: files.length,
          totalCount: files.length,
        });

        return { success: true };
      } catch (error) {
        logError('[useFileUpload]', error);
        const message =
          error instanceof Error ? error.message : 'Unknown error occurred';

        setProgress({
          isUploading: false,
          currentFile: null,
          uploadedCount: 0,
          totalCount: 0,
        });

        return { success: false, error: message };
      }
    },
    [],
  );

  return {
    uploadFiles,
    progress,
    isUploading: progress.isUploading,
  };
};
