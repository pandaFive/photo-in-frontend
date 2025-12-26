/**
 * バリデーションユーティリティ
 * SEC-007: クエリパラメータのバウンドチェック
 */

/**
 * IDバリデーション結果型
 * discriminated unionパターンでvalidプロパティによる型narrowingが可能
 */
export type IdValidationResult =
  | { valid: true; id: number }
  | { valid: false; error: string };

/**
 * IDパラメータのバリデーション
 * - 空文字チェック
 * - 数値チェック
 * - 正の整数チェック
 * - MAX_SAFE_INTEGER以下チェック
 */
export const validateId = (
  value: string | null | undefined,
): IdValidationResult => {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'IDが不正または未指定です' };
  }

  const id = Number(value);

  if (!Number.isInteger(id)) {
    return { valid: false, error: 'IDは整数である必要があります' };
  }

  if (id <= 0) {
    return { valid: false, error: 'IDは正の整数である必要があります' };
  }

  if (id > Number.MAX_SAFE_INTEGER) {
    return { valid: false, error: 'IDが範囲外です' };
  }

  return { valid: true, id };
};
