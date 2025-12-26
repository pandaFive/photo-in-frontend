/**
 * エラーレスポンスからメッセージを抽出するユーティリティ
 * CODE-002: client.tsとserverClient.tsで重複していた関数を共通化
 */

/**
 * エラーレスポンスからメッセージを抽出
 *
 * 対応形式:
 * - { errors: string[] } - 配列要素をカンマ区切りで結合
 * - { message: string } - messageプロパティを返却
 * - { error: string } - errorプロパティを返却
 * - 上記以外のJSON/非JSON - 元のテキストをそのまま返却
 *
 * @param text - エラーレスポンスのボディテキスト
 * @returns 抽出されたエラーメッセージ、空の場合は'Unknown error'
 */
export const parseErrorMessage = (text: string): string => {
  if (!text) return 'Unknown error';
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    if (Array.isArray(json.errors)) {
      // 空配列の場合はUnknown errorを返す
      if (json.errors.length === 0) {
        return 'Unknown error';
      }
      return (json.errors as string[]).join(', ');
    }
    if (typeof json.message === 'string') {
      return json.message;
    }
    if (typeof json.error === 'string') {
      return json.error;
    }
  } catch {
    // JSONパースに失敗した場合はそのままテキストを返す
  }
  return text;
};
