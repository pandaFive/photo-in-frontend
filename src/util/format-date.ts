/**
 * ISO 8601形式の日付文字列を「年-月-日」形式に変換する
 * @param isoString - ISO 8601形式の日付文字列
 * @returns 「年-月-日」形式の文字列
 */
export const formatIsoToYYYYMMDD = (isoString: string): string => {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
