import {
  ApiError,
  createApiError,
  createNetworkError,
  DomainError,
  err,
  isConflict,
  isDomainError,
  isForbidden,
  isServiceUnavailable,
  isUnauthorized,
  NetworkError,
  ok,
  toDisplayError,
} from '@/src/domain/types/error';

describe('error helpers', () => {
  describe('ok / err', () => {
    test('okは成功結果を返す', () => {
      const result = ok('success');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('success');
      }
    });

    test('errは失敗結果を返す', () => {
      const error: ApiError = { type: 'api', status: 500, message: 'Error' };
      const result = err(error);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toEqual(error);
      }
    });
  });

  describe('createApiError', () => {
    test('ApiErrorを生成する', () => {
      const error = createApiError(404, 'Not Found', { path: '/users' });
      expect(error.type).toBe('api');
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
      expect(error.details).toEqual({ path: '/users' });
    });
  });

  describe('createNetworkError', () => {
    test('NetworkErrorを生成する', () => {
      const error = createNetworkError('Connection timeout');
      expect(error.type).toBe('network');
      expect(error.message).toBe('Connection timeout');
    });
  });

  describe('isDomainError', () => {
    test('ApiErrorをDomainErrorと判定する', () => {
      const error: ApiError = { type: 'api', status: 500, message: 'Error' };
      expect(isDomainError(error)).toBe(true);
    });

    test('NetworkErrorをDomainErrorと判定する', () => {
      const error: NetworkError = { type: 'network', message: 'Error' };
      expect(isDomainError(error)).toBe(true);
    });

    test('nullはDomainErrorではない', () => {
      expect(isDomainError(null)).toBe(false);
    });

    test('undefinedはDomainErrorではない', () => {
      expect(isDomainError(undefined)).toBe(false);
    });

    test('通常のErrorはDomainErrorではない', () => {
      expect(isDomainError(new Error('test'))).toBe(false);
    });
  });

  describe('toDisplayError', () => {
    test('ApiErrorを表示用文字列に変換', () => {
      const error: ApiError = { type: 'api', status: 404, message: 'Not Found' };
      expect(toDisplayError(error)).toBe('エラー (404): Not Found');
    });

    test('NetworkErrorを表示用文字列に変換', () => {
      const error: NetworkError = { type: 'network', message: 'Connection failed' };
      expect(toDisplayError(error)).toBe('ネットワークエラー: Connection failed');
    });
  });

  describe('isUnauthorized', () => {
    test('401 APIエラーをtrueと判定', () => {
      const error: DomainError = { type: 'api', status: 401, message: 'Unauthorized' };
      expect(isUnauthorized(error)).toBe(true);
    });

    test('他のステータスコードはfalse', () => {
      const error: DomainError = { type: 'api', status: 403, message: 'Forbidden' };
      expect(isUnauthorized(error)).toBe(false);
    });

    test('NetworkErrorはfalse', () => {
      const error: DomainError = { type: 'network', message: 'Error' };
      expect(isUnauthorized(error)).toBe(false);
    });
  });

  describe('isForbidden', () => {
    test('403 APIエラーをtrueと判定', () => {
      const error: DomainError = { type: 'api', status: 403, message: 'Forbidden' };
      expect(isForbidden(error)).toBe(true);
    });

    test('他のステータスコードはfalse', () => {
      const error: DomainError = { type: 'api', status: 401, message: 'Unauthorized' };
      expect(isForbidden(error)).toBe(false);
    });

    test('NetworkErrorはfalse', () => {
      const error: DomainError = { type: 'network', message: 'Error' };
      expect(isForbidden(error)).toBe(false);
    });
  });

  describe('isConflict', () => {
    test('409 APIエラーをtrueと判定', () => {
      const error: DomainError = { type: 'api', status: 409, message: 'Conflict' };
      expect(isConflict(error)).toBe(true);
    });

    test('他のステータスコードはfalse', () => {
      const error: DomainError = { type: 'api', status: 400, message: 'Bad Request' };
      expect(isConflict(error)).toBe(false);
    });

    test('NetworkErrorはfalse', () => {
      const error: DomainError = { type: 'network', message: 'Error' };
      expect(isConflict(error)).toBe(false);
    });
  });

  describe('isServiceUnavailable', () => {
    test('503 APIエラーをtrueと判定', () => {
      const error: DomainError = { type: 'api', status: 503, message: 'Service Unavailable' };
      expect(isServiceUnavailable(error)).toBe(true);
    });

    test('他のステータスコードはfalse', () => {
      const error: DomainError = { type: 'api', status: 500, message: 'Internal Server Error' };
      expect(isServiceUnavailable(error)).toBe(false);
    });

    test('NetworkErrorはfalse', () => {
      const error: DomainError = { type: 'network', message: 'Error' };
      expect(isServiceUnavailable(error)).toBe(false);
    });
  });
});
