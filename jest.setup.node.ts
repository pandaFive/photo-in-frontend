/**
 * Node環境テスト用セットアップ
 * AWS Route Handlerテストなど、Node.js環境が必要なテストで使用
 */

// AWS環境変数の設定（モジュールロード前に必要）
process.env.REGION = 'ap-northeast-1';
process.env.ACCESS_KEY = 'test-access-key';
process.env.SECRET_ACCESS_KEY = 'test-secret-key';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.API_HOST = 'http://localhost:3000';
