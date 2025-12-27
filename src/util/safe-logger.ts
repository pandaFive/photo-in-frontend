/**
 * 安全なログ出力ユーティリティ
 * SEC-011: エラーログから機密情報を除去
 *
 * 機密情報のパターン:
 * - Authorization ヘッダー
 * - Cookie 値
 * - パスワード
 * - APIキー
 * - トークン
 */

/**
 * 機密情報を含む可能性のあるキーパターン
 */
const SENSITIVE_KEYS = [
  'authorization',
  'cookie',
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'access_token',
  'refresh_token',
  'bearer',
  'credentials',
];

/**
 * 機密情報を含む可能性のある値のパターン
 */
const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-_.]+/gi, // Bearer token
  /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*/g, // JWT
  /AKIA[A-Z0-9]{16}/g, // AWS Access Key
  /password=[\S]+/gi, // password parameter
];

/**
 * オブジェクトから機密情報を除去
 */
const sanitizeObject = (obj: unknown, depth = 0): unknown => {
  // 深さ制限（循環参照防止）
  if (depth > 5) {
    return '[Object too deep]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // 機密キーの値はマスク
    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * 文字列から機密情報を除去
 */
const sanitizeString = (str: string): string => {
  let result = str;

  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }

  return result;
};

/**
 * Errorオブジェクトから安全なメッセージを抽出
 */
const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // スタックトレースは本番環境では除外
    const message = sanitizeString(error.message);

    // 本番環境ではスタックトレースを含めない
    if (process.env.NODE_ENV === 'production') {
      return message;
    }

    // 開発環境ではスタックトレースも含める（ただしサニタイズ）
    if (error.stack) {
      return `${message}\n${sanitizeString(error.stack)}`;
    }

    return message;
  }

  if (typeof error === 'string') {
    return sanitizeString(error);
  }

  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(sanitizeObject(error));
    } catch {
      return '[Object]';
    }
  }

  return String(error);
};

/**
 * 安全なエラーログ出力
 * @param context - ログのコンテキスト（例: '[GET] /api/tasks'）
 * @param error - エラーオブジェクトまたはメッセージ
 */
export const logError = (context: string, error: unknown): void => {
  const safeMessage = getSafeErrorMessage(error);
  console.error(`${context}:`, safeMessage);
};

/**
 * 安全な警告ログ出力
 * @param context - ログのコンテキスト
 * @param message - 警告メッセージ
 */
export const logWarn = (context: string, message: string): void => {
  console.warn(`${context}:`, sanitizeString(message));
};

/**
 * 安全なデバッグログ出力（開発環境のみ）
 * @param context - ログのコンテキスト
 * @param data - ログデータ
 */
export const logDebug = (context: string, data: unknown): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  console.log(`${context}:`, sanitizeObject(data));
};
