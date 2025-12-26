/**
 * zodを使用したレスポンスバリデーションユーティリティ
 * CODE-001: 型アサーションにランタイムバリデーションを追加
 */

import { z } from 'zod';

import {
  Result,
  ok,
  err,
  createApiError,
} from '@/src/domain/types/error';

/**
 * zodスキーマでデータをバリデーションしResult型で返す
 *
 * @param schema - zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns 成功時はok(data)、失敗時はerr(ApiError)
 */
export const validateResponse = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Result<T> => {
  const result = schema.safeParse(data);
  if (result.success) {
    return ok(result.data);
  }
  // Zod 4は issues、Zod 3は errors を使用
  const issues = result.error.issues ?? result.error.errors ?? [];
  const message = issues.map((e: { message: string }) => e.message).join(', ');
  return err(createApiError(422, `Validation error: ${message}`));
};

/**
 * zodスキーマでデータをバリデーション（例外をスロー）
 * 内部使用向け - Result型が不要な場合
 *
 * @param schema - zodスキーマ
 * @param data - バリデーション対象のデータ
 * @returns バリデーション済みデータ
 * @throws ZodError バリデーション失敗時
 */
export const parseResponse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

/**
 * 安全なJSONパース + バリデーション
 *
 * @param schema - zodスキーマ
 * @param jsonString - JSONテキスト
 * @returns Result<T>
 */
export const safeParseJson = <T>(
  schema: z.ZodSchema<T>,
  jsonString: string,
): Result<T> => {
  try {
    const data: unknown = JSON.parse(jsonString);
    return validateResponse(schema, data);
  } catch {
    return err(createApiError(422, 'Invalid JSON format'));
  }
};
