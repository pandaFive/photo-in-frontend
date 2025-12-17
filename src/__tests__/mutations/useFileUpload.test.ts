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
const createMockFile = (name: string): File => {
  return new File(['test content'], name, { type: 'application/pdf' });
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
});
