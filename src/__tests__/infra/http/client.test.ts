import { httpClient } from '@/src/infra/http/client';

// fetchのモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('httpClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('get', () => {
    test('returns ok result on successful response', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockData);
      }
      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        signal: undefined,
        headers: undefined,
      });
    });

    test('returns error result on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(404);
        expect(result.error.message).toBe('Not Found');
      }
    });

    test('parses JSON error response with errors array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify({ errors: ['unauthorized', 'invalid token'], status: 401 })),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(401);
        expect(result.error.message).toBe('unauthorized, invalid token');
      }
    });

    test('parses JSON error response with single error in array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: () => Promise.resolve(JSON.stringify({ errors: ['Validation failed'], status: 422 })),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Validation failed');
      }
    });

    test('parses JSON error response with message field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve(JSON.stringify({ message: 'Internal server error' })),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(500);
        expect(result.error.message).toBe('Internal server error');
      }
    });

    test('parses JSON error response with error field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve(JSON.stringify({ error: 'Access denied' })),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(403);
        expect(result.error.message).toBe('Access denied');
      }
    });

    test('handles empty errors array gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ errors: [] })),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // 空のerrors配列の場合はUnknown errorを返す
        expect(result.error.message).toBe('Unknown error');
      }
    });

    test('handles empty error response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve(''),
      });

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Unknown error');
      }
    });

    test('returns network error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await httpClient.get('/api/test');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('network');
      }
    });

    test('rethrows AbortError', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(httpClient.get('/api/test')).rejects.toThrow('Aborted');
    });

    test('passes headers when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await httpClient.get('/api/test', {
        headers: { Authorization: 'Bearer token' },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        signal: undefined,
        headers: { Authorization: 'Bearer token' },
      });
    });
  });

  describe('post', () => {
    test('returns ok result on successful response', async () => {
      const mockData = { id: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await httpClient.post('/api/test', { name: 'Test' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockData);
      }
      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        signal: undefined,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });
    });

    test('returns error result on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      });

      const result = await httpClient.post('/api/test', { name: 'Test' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(400);
      }
    });

    test('handles post without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await httpClient.post('/api/test');

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        signal: undefined,
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });
  });

  describe('put', () => {
    test('returns ok result on successful response', async () => {
      const mockData = { updated: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockData)),
      });

      const result = await httpClient.put('/api/test/1', { name: 'Updated' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockData);
      }
    });

    test('handles empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      const result = await httpClient.put('/api/test/1');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({});
      }
    });

    test('handles non-JSON response as error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('OK'),
      });

      const result = await httpClient.put('/api/test/1');

      // 非JSONレスポンスはエラーとして扱う（サイレント失敗防止）
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('Invalid JSON response from server');
      }
    });
  });

  describe('delete', () => {
    test('returns ok result on successful response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      const result = await httpClient.delete('/api/test/1');

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
        signal: undefined,
        headers: undefined,
      });
    });

    test('returns error result on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve('Forbidden'),
      });

      const result = await httpClient.delete('/api/test/1');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(403);
      }
    });
  });

  describe('postFormData', () => {
    test('returns ok result on successful response', async () => {
      const mockData = { uploaded: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockData)),
      });

      const formData = new FormData();
      formData.append('file', 'test');

      const result = await httpClient.postFormData('/api/upload', formData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockData);
      }
      // Content-Type should NOT be set for FormData
      expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        signal: undefined,
        headers: undefined,
        body: formData,
      });
    });

    test('handles empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      const formData = new FormData();
      const result = await httpClient.postFormData('/api/upload', formData);

      expect(result.ok).toBe(true);
    });

    test('returns error result on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        text: () => Promise.resolve('Payload Too Large'),
      });

      const formData = new FormData();
      const result = await httpClient.postFormData('/api/upload', formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(413);
      }
    });
  });
});
