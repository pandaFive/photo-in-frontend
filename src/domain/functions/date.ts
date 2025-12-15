/**
 * Date関連の純粋関数
 * すべての関数はDateオブジェクトを引数として受け取り、new Date()を内部で呼ばない
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_IN_WEEK = 7;

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * DateオブジェクトからYYYY-MM-DD形式の文字列を生成
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * ISO 8601形式の文字列をパースしてYYYY-MM-DD形式に変換
 * 注: new Date()を使用するが、外部からの文字列パースなので許容
 */
export const parseIsoToYYYYMMDD = (isoString: string): string => {
  const date = new Date(isoString);
  return formatDateToYYYYMMDD(date);
};

/**
 * Dateオブジェクトから年を取得
 */
export const getYear = (date: Date): number => {
  return date.getFullYear();
};

/**
 * Dateオブジェクトから「日 月名, 年」形式の文字列を生成（英語）
 * 例: "1 January, 2024"
 */
export const formatDateToEnglish = (date: Date): string => {
  const monthIndex = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  return `${day} ${MONTHS_EN[monthIndex]}, ${year}`;
};

/**
 * Dateオブジェクトから「M月D日」形式の文字列を生成（日本語）
 * 例: "1月15日"
 */
export const formatDateToJapanese = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

/**
 * 指定した日付から過去1週間分の日付文字列配列を生成
 * @param today 基準日
 * @returns 「M月D日」形式の文字列配列（1週間前から今日まで）
 */
export const getDatesForPastWeek = (today: Date): string[] => {
  const dates: string[] = [];
  const oneWeekAgo = new Date(today.getTime() - (DAYS_IN_WEEK - 1) * MS_PER_DAY);

  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const date = new Date(oneWeekAgo.getTime() + i * MS_PER_DAY);
    dates.push(formatDateToJapanese(date));
  }

  return dates;
};

/**
 * 日付文字列配列をソート（昇順）
 * @param dates 日付文字列の配列
 * @returns ソート済み配列
 */
export const sortDateStrings = (dates: string[]): string[] => {
  return dates.toSorted(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
};

/**
 * Dateオブジェクトをローカル日付文字列に変換
 */
export const toLocaleDateString = (date: Date): string => {
  return date.toLocaleDateString();
};
