import {
  parseErrorMessage,
  serverHttpClient,
} from '@/src/infra/http/serverClient';

// fetchのモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 環境変数のモック
const originalEnv = process.env;

describe('serverHttpClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    process.env = { ...originalEnv, API_HOST: 'http://api.example.com' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('parseErrorMessage', () => {
    test('空文字列の場合はUnknown errorを返す', () => {
      expect(parseErrorMessage('')).toBe('Unknown error');
    });

    test('{ errors: string[] }形式をカンマ区切りで結合', () => {
      const json = JSON.stringify({ errors: ['Field required', 'Invalid format'] });
      expect(parseErrorMessage(json)).toBe('Field required, Invalid format');
    });

    test('{ errors: [] }空配列の場合は元テキストを返す', () => {
      const json = JSON.stringify({ errors: [] });
      expect(parseErrorMessage(json)).toBe(json);
    });

    test('{ message: string }形式をパース', () => {
      const json = JSON.stringify({ message: 'Something went wrong' });
      expect(parseErrorMessage(json)).toBe('Something went wrong');
    });

    test('{ error: string }形式をパース', () => {
      const json = JSON.stringify({ error: 'Not Found' });
      expect(parseErrorMessage(json)).toBe('Not Found');
    });

    test('非JSON文字列はそのまま返す', () => {
      expect(parseErrorMessage('Plain text error')).toBe('Plain text error');
    });

    test('認識できないJSON形式は元テキストを返す', () => {
      const json = JSON.stringify({ status: 'failed', code: 500 });
      expect(parseErrorMessage(json)).toBe(json);
    });

    test('errors配列内の単一要素を正しく処理', () => {
      const json = JSON.stringify({ errors: ['Single error'] });
      expect(parseErrorMessage(json)).toBe('Single error');
    });
  });

  describe('get', () => {
    test('returns ok result on successful response', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await serverHttpClient.get('/users');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockData);
      }
      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/users',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    test('returns error result on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      });

      const result = await serverHttpClient.get('/users/999');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(404);
        expect(result.error.message).toBe('Not Found');
      }
    });

    test('returns network error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await serverHttpClient.get('/users');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('network');
      }
    });

    test('passes headers when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await serverHttpClient.get('/users', {
        headers: { Authorization: 'Bearer token' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/users',
        expect.objectContaining({
          headers: { Authorization: 'Bearer token' },
        }),
      );
    });

    test('passes cache option when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await serverHttpClient.get('/users', { cache: 'no-store' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/users',
        expect.objectContaining({ cache: 'no-store' }),
      );
    });

    test('passes revalidate option when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await serverHttpClient.get('/users', { revalidate: 300 });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/users',
        expect.objectContaining({ next: { revalidate: 300 } }),
      );
    });

    test('returns error when API_HOST is not set', async () => {
      delete process.env.API_HOST;

      const result = await serverHttpClient.get('/users');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('network');
        expect(result.error.message).toContain('API_HOST');
      }
    });
  });

  describe('post', () => {
    test('returns ok result on successful response', async () => {
      const mockData = { id: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await serverHttpClient.post('/users', { name: 'Test' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockData);
      }
      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Test' }),
        }),
      );
    });

    test('returns error result on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      });

      const result = await serverHttpClient.post('/users', { name: '' });

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

      await serverHttpClient.post('/trigger');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/trigger',
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        }),
      );
    });

    test('passes cache option when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await serverHttpClient.post('/users', { name: 'Test' }, { cache: 'no-store' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.example.com/users',
        expect.objectContaining({ cache: 'no-store' }),
      );
    });

    test('returns network error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await serverHttpClient.post('/users', { name: 'Test' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('network');
      }
    });
  });
});
