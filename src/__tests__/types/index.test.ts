import { isErrorResponse } from '@/src/types';

describe('isErrorResponse', () => {
  describe('正常なErrorResponseの判定', () => {
    test('errors配列を持つオブジェクトはtrueを返す', () => {
      expect(isErrorResponse({ errors: ['エラーメッセージ'] })).toBe(true);
    });

    test('複数のエラーメッセージを持つ場合もtrueを返す', () => {
      expect(isErrorResponse({ errors: ['エラー1', 'エラー2', 'エラー3'] })).toBe(true);
    });

    test('空のerrors配列を持つオブジェクトはtrueを返す', () => {
      expect(isErrorResponse({ errors: [] })).toBe(true);
    });

    test('追加のプロパティがあってもtrueを返す', () => {
      expect(isErrorResponse({ errors: ['エラー'], extra: 'value' })).toBe(true);
    });
  });

  describe('不正な値の判定', () => {
    test('nullはfalseを返す', () => {
      expect(isErrorResponse(null)).toBe(false);
    });

    test('undefinedはfalseを返す', () => {
      expect(isErrorResponse(undefined)).toBe(false);
    });

    test('文字列はfalseを返す', () => {
      expect(isErrorResponse('error')).toBe(false);
    });

    test('数値はfalseを返す', () => {
      expect(isErrorResponse(123)).toBe(false);
    });

    test('配列はfalseを返す', () => {
      expect(isErrorResponse(['error'])).toBe(false);
    });

    test('errorsプロパティがないオブジェクトはfalseを返す', () => {
      expect(isErrorResponse({ message: 'error' })).toBe(false);
    });

    test('errorsが配列でないオブジェクトはfalseを返す', () => {
      expect(isErrorResponse({ errors: 'not an array' })).toBe(false);
    });

    test('errorsがnullのオブジェクトはfalseを返す', () => {
      expect(isErrorResponse({ errors: null })).toBe(false);
    });
  });

  describe('配列要素の型検証', () => {
    test('errors配列に数値が含まれる場合はfalseを返す', () => {
      expect(isErrorResponse({ errors: [123] })).toBe(false);
    });

    test('errors配列にnullが含まれる場合はfalseを返す', () => {
      expect(isErrorResponse({ errors: [null] })).toBe(false);
    });

    test('errors配列にundefinedが含まれる場合はfalseを返す', () => {
      expect(isErrorResponse({ errors: [undefined] })).toBe(false);
    });

    test('errors配列にオブジェクトが含まれる場合はfalseを返す', () => {
      expect(isErrorResponse({ errors: [{ message: 'error' }] })).toBe(false);
    });

    test('errors配列に混合型が含まれる場合はfalseを返す', () => {
      expect(isErrorResponse({ errors: ['valid', 123, null] })).toBe(false);
    });
  });

  describe('旧形式との互換性', () => {
    test('旧形式のmessageのみのオブジェクトはfalseを返す', () => {
      expect(isErrorResponse({ message: 'エラーメッセージ' })).toBe(false);
    });

    test('messageとerrorsの両方があればtrueを返す', () => {
      expect(isErrorResponse({ message: 'エラー', errors: ['詳細'] })).toBe(true);
    });
  });
});
