/**
 * ISO 8601形式の日付文字列を「年-月-日」形式に変換する
 * @param isoString - ISO 8601形式の日付文字列
 * @returns 「年-月-日」形式の文字列
 * @deprecated 代わりに @/src/domain/functions/date の parseIsoToYYYYMMDD を使用してください
 */
export { parseIsoToYYYYMMDD as formatIsoToYYYYMMDD } from '@/src/domain/functions/date';
