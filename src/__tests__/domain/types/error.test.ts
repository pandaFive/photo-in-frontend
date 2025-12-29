import { getExceptionMessage } from '@/src/domain/types/error';

describe('getExceptionMessage', () => {
  describe('ネットワークエラー', () => {
    it('TypeErrorの場合、ネットワークエラーメッセージを返す', () => {
      const error = new TypeError('Failed to fetch');
      expect(getExceptionMessage(error)).toBe(
        'ネットワーク接続に問題があります。接続を確認してください。',
      );
    });
  });

  describe('タイムアウトエラー', () => {
    it('AbortErrorの場合、タイムアウトメッセージを返す', () => {
      const error = new DOMException('The operation was aborted', 'AbortError');
      expect(getExceptionMessage(error)).toBe(
        'リクエストがタイムアウトしました。再試行してください。',
      );
    });

    it('AbortError以外のDOMExceptionの場合、フォールバックメッセージを返す', () => {
      const error = new DOMException('Some error', 'NotFoundError');
      expect(getExceptionMessage(error)).toBe('エラーが発生しました。');
    });
  });

  describe('その他のエラー', () => {
    it('一般的なErrorの場合、フォールバックメッセージを返す', () => {
      const error = new Error('Something went wrong');
      expect(getExceptionMessage(error)).toBe('エラーが発生しました。');
    });

    it('カスタムフォールバックメッセージを使用できる', () => {
      const error = new Error('Something went wrong');
      expect(getExceptionMessage(error, 'データの取得に失敗しました。')).toBe(
        'データの取得に失敗しました。',
      );
    });

    it('nullの場合、フォールバックメッセージを返す', () => {
      expect(getExceptionMessage(null)).toBe('エラーが発生しました。');
    });

    it('undefinedの場合、フォールバックメッセージを返す', () => {
      expect(getExceptionMessage(undefined)).toBe('エラーが発生しました。');
    });

    it('文字列の場合、フォールバックメッセージを返す', () => {
      expect(getExceptionMessage('error string')).toBe('エラーが発生しました。');
    });
  });
});
