import { useCallback, useState } from 'react';

type UploadResult = {
  success: boolean;
  error?: string;
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
   */
  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadResult> => {
      if (files.length === 0) {
        return { success: false, error: 'ファイルが選択されていません' };
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

          const response = await fetch('/api/aws', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorBody = (await response.json()) as unknown;
            const errorMessage =
              typeof errorBody === 'object' &&
              errorBody !== null &&
              'error' in errorBody &&
              typeof (errorBody as { error?: unknown }).error === 'string'
                ? (errorBody as { error?: string }).error
                : 'Unknown error';
            throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
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
    []
  );

  return {
    uploadFiles,
    progress,
    isUploading: progress.isUploading,
  };
};
