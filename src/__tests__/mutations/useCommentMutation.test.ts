import { renderHook, act } from '@testing-library/react';
import { useCommentMutation } from '@/src/mutations/useCommentMutation';
import { httpClient } from '@/src/infra/http';

// httpClientをモック
jest.mock('@/src/infra/http', () => ({
  httpClient: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('useCommentMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    test('returns success result on successful creation', async () => {
      const mockComment = { id: 1, content: 'Test comment' };
      mockHttpClient.post.mockResolvedValueOnce({
        ok: true,
        value: mockComment,
      });

      const { result } = renderHook(() => useCommentMutation());

      let response;
      await act(async () => {
        response = await result.current.createComment('Test comment', 1, 100);
      });

      expect(response).toEqual({ success: true, data: mockComment });
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/comment', {
        content: 'Test comment',
        accountId: 1,
        taskId: 100,
      });
    });

    test('returns error result on failure', async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 400, message: 'Bad Request' },
      });

      const { result } = renderHook(() => useCommentMutation());

      let response;
      await act(async () => {
        response = await result.current.createComment('Test', 1, 100);
      });

      expect(response).toEqual({ success: false, error: 'Bad Request' });
    });
  });

  describe('updateComment', () => {
    test('returns success result on successful update', async () => {
      const mockComment = { id: 1, content: 'Updated comment' };
      mockHttpClient.put.mockResolvedValueOnce({
        ok: true,
        value: mockComment,
      });

      const { result } = renderHook(() => useCommentMutation());

      let response;
      await act(async () => {
        response = await result.current.updateComment('Updated comment', 1);
      });

      expect(response).toEqual({ success: true, data: mockComment });
      expect(mockHttpClient.put).toHaveBeenCalledWith('/api/comment', {
        content: 'Updated comment',
        id: 1,
      });
    });

    test('returns error result on failure', async () => {
      mockHttpClient.put.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 404, message: 'Not Found' },
      });

      const { result } = renderHook(() => useCommentMutation());

      let response;
      await act(async () => {
        response = await result.current.updateComment('Updated', 999);
      });

      expect(response).toEqual({ success: false, error: 'Not Found' });
    });
  });

  describe('deleteComment', () => {
    test('returns success result on successful deletion', async () => {
      mockHttpClient.delete.mockResolvedValueOnce({
        ok: true,
        value: { message: 'Deleted' },
      });

      const { result } = renderHook(() => useCommentMutation());

      let response;
      await act(async () => {
        response = await result.current.deleteComment(1);
      });

      expect(response).toEqual({ success: true, data: { message: 'Deleted' } });
      expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/comment?commentId=1');
    });

    test('returns error result on failure', async () => {
      mockHttpClient.delete.mockResolvedValueOnce({
        ok: false,
        error: { type: 'api', status: 403, message: 'Forbidden' },
      });

      const { result } = renderHook(() => useCommentMutation());

      let response;
      await act(async () => {
        response = await result.current.deleteComment(1);
      });

      expect(response).toEqual({ success: false, error: 'Forbidden' });
    });
  });

  test('hook returns all mutation functions', () => {
    const { result } = renderHook(() => useCommentMutation());

    expect(result.current.createComment).toBeDefined();
    expect(result.current.updateComment).toBeDefined();
    expect(result.current.deleteComment).toBeDefined();
  });
});
