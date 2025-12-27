import { logError, logWarn, logDebug } from '@/src/util/safe-logger';

// console のモック
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('safe-logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logError', () => {
    test('コンテキストとエラーメッセージを出力する', () => {
      const error = new Error('Something went wrong');
      logError('[Test]', error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Test]:',
        expect.stringContaining('Something went wrong'),
      );
    });

    test('Errorオブジェクト以外も処理できる', () => {
      logError('[Test]', 'Plain string error');

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Test]:',
        'Plain string error',
      );
    });

    test('オブジェクトをJSON文字列に変換して出力する', () => {
      logError('[Test]', { code: 'ERR_001', details: 'Details' });

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Test]:',
        expect.stringContaining('ERR_001'),
      );
    });

    describe('機密情報のサニタイズ', () => {
      test('Bearer tokenをマスクする', () => {
        const error = new Error('Auth failed: Bearer abc123xyz.token.here');
        logError('[Auth]', error);

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[Auth]:',
          expect.not.stringContaining('abc123xyz'),
        );
        expect(mockConsoleError).toHaveBeenCalledWith(
          '[Auth]:',
          expect.stringContaining('[REDACTED]'),
        );
      });

      test('JWTトークンをマスクする', () => {
        const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.Rq8IjqbeX9q';
        const error = new Error(`Token: ${jwt}`);
        logError('[Auth]', error);

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[Auth]:',
          expect.not.stringContaining('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
        );
        expect(mockConsoleError).toHaveBeenCalledWith(
          '[Auth]:',
          expect.stringContaining('[REDACTED]'),
        );
      });

      test('AWS Access Keyをマスクする', () => {
        const error = new Error('AWS Error: AKIAIOSFODNN7EXAMPLE key invalid');
        logError('[AWS]', error);

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[AWS]:',
          expect.not.stringContaining('AKIAIOSFODNN7EXAMPLE'),
        );
        expect(mockConsoleError).toHaveBeenCalledWith(
          '[AWS]:',
          expect.stringContaining('[REDACTED]'),
        );
      });

      test('passwordパラメータをマスクする', () => {
        const error = new Error('Request failed: password=secretpass123');
        logError('[Login]', error);

        expect(mockConsoleError).toHaveBeenCalledWith(
          '[Login]:',
          expect.not.stringContaining('secretpass123'),
        );
        expect(mockConsoleError).toHaveBeenCalledWith(
          '[Login]:',
          expect.stringContaining('[REDACTED]'),
        );
      });

      test('オブジェクト内の機密キーをマスクする', () => {
        const errorData = {
          message: 'Auth error',
          authorization: 'Bearer secret-token',
          cookie: 'session=abc123',
          password: 'mypassword',
          token: 'refresh-token-value',
        };
        logError('[API]', errorData);

        const loggedArg = mockConsoleError.mock.calls[0][1];
        expect(loggedArg).toContain('[REDACTED]');
        expect(loggedArg).not.toContain('secret-token');
        expect(loggedArg).not.toContain('session=abc123');
        expect(loggedArg).not.toContain('mypassword');
        expect(loggedArg).not.toContain('refresh-token-value');
      });
    });

    test('nullやundefinedを安全に処理する', () => {
      logError('[Test]', null);
      expect(mockConsoleError).toHaveBeenCalledWith('[Test]:', 'null');

      logError('[Test]', undefined);
      expect(mockConsoleError).toHaveBeenCalledWith('[Test]:', 'undefined');
    });
  });

  describe('logWarn', () => {
    test('コンテキストと警告メッセージを出力する', () => {
      logWarn('[Warn]', 'This is a warning');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Warn]:',
        'This is a warning',
      );
    });

    test('機密情報をマスクする', () => {
      logWarn('[Auth]', 'Token expired: Bearer abc123.def.ghi');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Auth]:',
        expect.not.stringContaining('abc123'),
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Auth]:',
        expect.stringContaining('[REDACTED]'),
      );
    });
  });

  describe('logDebug', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('開発環境ではログを出力する', () => {
      process.env.NODE_ENV = 'development';

      logDebug('[Debug]', { data: 'test' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Debug]:',
        expect.objectContaining({ data: 'test' }),
      );
    });

    test('本番環境ではログを出力しない', () => {
      process.env.NODE_ENV = 'production';

      logDebug('[Debug]', { data: 'test' });

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    test('テスト環境ではログを出力しない', () => {
      process.env.NODE_ENV = 'test';

      logDebug('[Debug]', { data: 'test' });

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    test('開発環境でも機密情報をマスクする', () => {
      process.env.NODE_ENV = 'development';

      logDebug('[Debug]', { token: 'secret-value', data: 'normal' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Debug]:',
        expect.objectContaining({
          token: '[REDACTED]',
          data: 'normal',
        }),
      );
    });
  });
});
