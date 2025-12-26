/**
 * バリデーションユーティリティテスト
 * CODE-001: zodスキーマバリデーション
 */

import { z } from 'zod';

import {
  validateResponse,
  parseResponse,
  safeParseJson,
} from '@/src/infra/validation';

describe('validation utility', () => {
  // テスト用スキーマ
  const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  });

  describe('validateResponse', () => {
    test('有効なデータの場合はok(data)を返す', () => {
      const validData = { id: 1, name: 'Test User', email: 'test@example.com' };

      const result = validateResponse(UserSchema, validData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(validData);
      }
    });

    test('無効なデータの場合はerr(ApiError)を返す', () => {
      const invalidData = { id: 'not-a-number', name: 'Test', email: 'test@example.com' };

      const result = validateResponse(UserSchema, invalidData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('api');
        expect(result.error.status).toBe(422);
        expect(result.error.message).toContain('Validation error');
      }
    });

    test('必須フィールドがない場合はerr(ApiError)を返す', () => {
      const missingFields = { id: 1 };

      const result = validateResponse(UserSchema, missingFields);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.status).toBe(422);
        expect(result.error.message).toContain('Validation error');
      }
    });

    test('メールアドレス形式が無効な場合はerr(ApiError)を返す', () => {
      const invalidEmail = { id: 1, name: 'Test', email: 'not-an-email' };

      const result = validateResponse(UserSchema, invalidEmail);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Validation error');
      }
    });

    test('配列スキーマでバリデーションできる', () => {
      const ArraySchema = z.array(z.number());
      const validArray = [1, 2, 3];

      const result = validateResponse(ArraySchema, validArray);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([1, 2, 3]);
      }
    });

    test('nullを渡した場合はerr(ApiError)を返す', () => {
      const result = validateResponse(UserSchema, null);

      expect(result.ok).toBe(false);
    });

    test('undefinedを渡した場合はerr(ApiError)を返す', () => {
      const result = validateResponse(UserSchema, undefined);

      expect(result.ok).toBe(false);
    });
  });

  describe('parseResponse', () => {
    test('有効なデータの場合はパース済みデータを返す', () => {
      const validData = { id: 1, name: 'Test User', email: 'test@example.com' };

      const result = parseResponse(UserSchema, validData);

      expect(result).toEqual(validData);
    });

    test('無効なデータの場合はZodErrorをスロー', () => {
      const invalidData = { id: 'not-a-number', name: 'Test', email: 'test@example.com' };

      expect(() => parseResponse(UserSchema, invalidData)).toThrow();
    });
  });

  describe('safeParseJson', () => {
    test('有効なJSONの場合はok(data)を返す', () => {
      const json = JSON.stringify({ id: 1, name: 'Test', email: 'test@example.com' });

      const result = safeParseJson(UserSchema, json);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(1);
        expect(result.value.name).toBe('Test');
      }
    });

    test('無効なJSON形式の場合はerr(ApiError)を返す', () => {
      const invalidJson = 'not valid json';

      const result = safeParseJson(UserSchema, invalidJson);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.status).toBe(422);
        expect(result.error.message).toBe('Invalid JSON format');
      }
    });

    test('JSONとしては有効だがスキーマに合わない場合はerr(ApiError)を返す', () => {
      const json = JSON.stringify({ id: 'invalid', name: 123 });

      const result = safeParseJson(UserSchema, json);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Validation error');
      }
    });

    test('空文字の場合はerr(ApiError)を返す', () => {
      const result = safeParseJson(UserSchema, '');

      expect(result.ok).toBe(false);
    });
  });
});
