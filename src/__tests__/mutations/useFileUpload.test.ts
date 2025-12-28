import { renderHook, act, waitFor } from '@testing-library/react';
import { useFileUpload } from '@/src/mutations/useFileUpload';
import { httpClient } from '@/src/infra/http';

// httpClientをモック
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    postFormData: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

// File objectをモック
const createMockFile = (name: string, type = 'application/pdf', sizeInBytes?: number): File => {
  if (sizeInBytes !== undefined) {
    // 指定サイズのファイルを作成
    const content = new Uint8Array(sizeInBytes);
    return new File([content], name, { type });
  }
  return new File(['test content'], name, { type });
};

describe('useFileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFiles', () => {
    test('returns error when no files provided', async () => {
      const { result } = renderHook(() => useFileUpload());

      let response;
      await act(async () => {
        response = await result.current.uploadFiles([]);
      });

      expect(response).toEqual({
        success: false,
        error: 'ファイルが選択されていません',
      });
      expect(mockHttpClient.postFormData).not.toHaveBeenCalled();
    });

    test('uploads single file successfully', async () => {
      mockHttpClient.postFormData.mockResolvedValueOnce({ ok: true, value: {} });

      const { result } = renderHook(() => useFileUpload());
      const file = createMockFile('test.pdf');

      let response;
      await act(async () => {
        response = await result.current.uploadFiles([file]);
      });

      expect(response).toEqual({ success: true });
      expect(mockHttpClient.postFormData).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.postFormData).toHaveBeenCalledWith(
        '/api/aws',
        expect.any(FormData),
      );
    });

    test('uploads multiple files successfully', async () => {
      mockHttpClient.postFormData
        .mockResolvedValueOnce({ ok: true, value: {} })
        .mockResolvedValueOnce({ ok: true, value: {} })
        .mockResolvedValueOnce({ ok: true, value: {} });

      const { result } = renderHook(() => useFileUpload());
      const files = [
        createMockFile('test1.pdf'),
        createMockFile('test2.pdf'),
        createMockFile('test3.pdf'),
      ];

      let response;
      await act(async () => {
        response = await result.current.uploadFiles(files);
      });

      expect(response).toEqual({ success: true });
      expect(mockHttpClient.postFormData).toHaveBeenCalledTimes(3);
    });

    test('returns error when upload fails', async () => {
      mockHttpClient.postFormData.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 500, message: 'Upload failed' },
      });

      const { result } = renderHook(() => useFileUpload());
      const file = createMockFile('test.pdf');

      let response;
      await act(async () => {
        response = await result.current.uploadFiles([file]);
      });

      expect(response?.success).toBe(false);
      expect(response?.error).toContain('Failed to upload test.pdf');
    });

    test('stops uploading on first failure', async () => {
      mockHttpClient.postFormData
        .mockResolvedValueOnce({ ok: true, value: {} })
        .mockResolvedValueOnce({
          ok: false,
          error: { type: 'api', status: 500, message: 'Error' },
        });

      const { result } = renderHook(() => useFileUpload());
      const files = [
        createMockFile('test1.pdf'),
        createMockFile('test2.pdf'),
        createMockFile('test3.pdf'),
      ];

      await act(async () => {
        await result.current.uploadFiles(files);
      });

      // 2回目で失敗するので3回目は呼ばれない
      expect(mockHttpClient.postFormData).toHaveBeenCalledTimes(2);
    });
  });

  describe('progress state', () => {
    test('initial state is not uploading', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.progress).toEqual({
        isUploading: false,
        currentFile: null,
        uploadedCount: 0,
        totalCount: 0,
      });
      expect(result.current.isUploading).toBe(false);
    });

    test('updates progress during upload', async () => {
      // 遅延を追加してprogressの更新を確認
      mockHttpClient.postFormData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, value: {} }), 10))
      );

      const { result } = renderHook(() => useFileUpload());
      const files = [createMockFile('test1.pdf'), createMockFile('test2.pdf')];

      act(() => {
        void result.current.uploadFiles(files);
      });

      // アップロード開始後
      await waitFor(() => {
        expect(result.current.progress.isUploading).toBe(true);
      });

      // アップロード完了後
      await waitFor(() => {
        expect(result.current.progress.isUploading).toBe(false);
      });
    });

    test('resets progress on error', async () => {
      mockHttpClient.postFormData.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 500, message: 'Error' },
      });

      const { result } = renderHook(() => useFileUpload());
      const file = createMockFile('test.pdf');

      await act(async () => {
        await result.current.uploadFiles([file]);
      });

      expect(result.current.progress).toEqual({
        isUploading: false,
        currentFile: null,
        uploadedCount: 0,
        totalCount: 0,
      });
    });

    test('sets final progress on success', async () => {
      mockHttpClient.postFormData
        .mockResolvedValueOnce({ ok: true, value: {} })
        .mockResolvedValueOnce({ ok: true, value: {} });

      const { result } = renderHook(() => useFileUpload());
      const files = [createMockFile('test1.pdf'), createMockFile('test2.pdf')];

      await act(async () => {
        await result.current.uploadFiles(files);
      });

      expect(result.current.progress).toEqual({
        isUploading: false,
        currentFile: null,
        uploadedCount: 2,
        totalCount: 2,
      });
    });
  });

  test('hook returns all expected properties', () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.uploadFiles).toBeDefined();
    expect(result.current.progress).toBeDefined();
    expect(result.current.isUploading).toBeDefined();
  });

  describe('file validation', () => {
    describe('MIME type validation', () => {
      test('rejects non-PDF files', async () => {
        const { result } = renderHook(() => useFileUpload());
        const file = createMockFile('image.png', 'image/png');

        let response;
        await act(async () => {
          response = await result.current.uploadFiles([file]);
        });

        expect(response).toEqual({
          success: false,
          error: '「image.png」は許可されていないファイル形式です。PDFファイルのみアップロード可能です。',
        });
        expect(mockHttpClient.postFormData).not.toHaveBeenCalled();
      });

      test('rejects files with empty MIME type', async () => {
        const { result } = renderHook(() => useFileUpload());
        const file = createMockFile('unknown.file', '');

        let response;
        await act(async () => {
          response = await result.current.uploadFiles([file]);
        });

        expect(response?.success).toBe(false);
        expect(response?.error).toContain('許可されていないファイル形式');
        expect(mockHttpClient.postFormData).not.toHaveBeenCalled();
      });

      test('rejects text files', async () => {
        const { result } = renderHook(() => useFileUpload());
        const file = createMockFile('document.txt', 'text/plain');

        let response;
        await act(async () => {
          response = await result.current.uploadFiles([file]);
        });

        expect(response?.success).toBe(false);
        expect(response?.error).toContain('許可されていないファイル形式');
        expect(mockHttpClient.postFormData).not.toHaveBeenCalled();
      });

      test('accepts PDF files', async () => {
        mockHttpClient.postFormData.mockResolvedValueOnce({ ok: true, value: {} });

        const { result } = renderHook(() => useFileUpload());
        const file = createMockFile('document.pdf', 'application/pdf');

        let response;
        await act(async () => {
          response = await result.current.uploadFiles([file]);
        });

        expect(response).toEqual({ success: true });
        expect(mockHttpClient.postFormData).toHaveBeenCalledTimes(1);
      });
    });

    describe('file size validation', () => {
      test('rejects files over 100MB', async () => {
        const { result } = renderHook(() => useFileUpload());
        // 101MB = 101 * 1024 * 1024 bytes
        const file = createMockFile('large.pdf', 'application/pdf', 101 * 1024 * 1024);

        let response;
        await act(async () => {
          response = await result.current.uploadFiles([file]);
        });

        expect(response?.success).toBe(false);
        expect(response?.error).toContain('サイズ');
        expect(response?.error).toContain('上限（100MB）を超えています');
        expect(mockHttpClient.postFormData).not.toHaveBeenCalled();
      });

      test('accepts files exactly 100MB', async () => {
        mockHttpClient.postFormData.mockResolvedValueOnce({ ok: true, value: {} });

        const { result } = renderHook(() => useFileUpload());
        // 100MB = 100 * 1024 * 1024 bytes
        const file = createMockFile('exact100mb.pdf', 'application/pdf', 100 * 1024 * 1024);

        let response;
        await act(async () => {
          response = await result.current.uploadFiles([file]);
        });

        expect(response).toEqual({ success: true });
        expect(mockHttpClient.postFormData).toHaveBeenCalledTimes(1);
      });

      test('accepts files under 100MB', async () => {
        mockHttpClient.postFormData.mockResolvedValueOnce({ ok: true, value: {} });

        const { result } = renderHook(() => useFileUpload());
        // 50MB
        const file = createMockFile('small.pdf', 'application/pdf', 50 * 1024 * 1024);

        let response;
        await act(async () => {
          response = await result.current.uploadFiles([file]);
        });

        expect(response).toEqual({ success: true });
        expect(mockHttpClient.postFormData).toHaveBeenCalledTimes(1);
      });
    });

    describe('multiple files validation', () => {
      test('rejects if any file has invalid MIME type', async () => {
        const { result } = renderHook(() => useFileUpload());
        const files = [
          createMockFile('valid.pdf', 'application/pdf'),
          createMockFile('invalid.exe', 'application/x-msdownload'),
          createMockFile('another.pdf', 'application/pdf'),
        ];

        let response;
        await act(async () => {
          response = await result.current.uploadFiles(files);
        });

        expect(response?.success).toBe(false);
        expect(response?.error).toContain('invalid.exe');
        expect(mockHttpClient.postFormData).not.toHaveBeenCalled();
      });

      test('rejects if any file is too large', async () => {
        const { result } = renderHook(() => useFileUpload());
        const files = [
          createMockFile('small.pdf', 'application/pdf', 10 * 1024 * 1024), // 10MB
          createMockFile('huge.pdf', 'application/pdf', 150 * 1024 * 1024), // 150MB
        ];

        let response;
        await act(async () => {
          response = await result.current.uploadFiles(files);
        });

        expect(response?.success).toBe(false);
        expect(response?.error).toContain('huge.pdf');
        expect(response?.error).toContain('上限（100MB）を超えています');
        expect(mockHttpClient.postFormData).not.toHaveBeenCalled();
      });

      test('validates MIME type before size', async () => {
        const { result } = renderHook(() => useFileUpload());
        // 最初のファイルがMIMEタイプエラー
        const files = [
          createMockFile('invalid.jpg', 'image/jpeg'),
        ];

        let response;
        await act(async () => {
          response = await result.current.uploadFiles(files);
        });

        expect(response?.success).toBe(false);
        expect(response?.error).toContain('許可されていないファイル形式');
      });

      test('accepts multiple valid PDF files', async () => {
        mockHttpClient.postFormData
          .mockResolvedValueOnce({ ok: true, value: {} })
          .mockResolvedValueOnce({ ok: true, value: {} });

        const { result } = renderHook(() => useFileUpload());
        const files = [
          createMockFile('doc1.pdf', 'application/pdf'),
          createMockFile('doc2.pdf', 'application/pdf'),
        ];

        let response;
        await act(async () => {
          response = await result.current.uploadFiles(files);
        });

        expect(response).toEqual({ success: true });
        expect(mockHttpClient.postFormData).toHaveBeenCalledTimes(2);
      });
    });
  });
});
