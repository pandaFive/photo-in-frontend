# SEC-002: AWS認証情報をIAMロールに移行

**作成日**: 2025-12-28
**優先度**: High
**工数目安**: 4時間（インフラ側作業含む）
**ステータス**: 未着手

---

## 概要

### 現状の問題

`src/app/api/aws/route.ts` において、AWS認証情報を環境変数で直接管理している：

```typescript
const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
```

### セキュリティリスク

| リスク | 説明 |
|--------|------|
| 認証情報漏洩 | 環境変数がログやエラーメッセージに含まれる可能性 |
| ローテーション困難 | キーの定期更新が手動作業になる |
| 最小権限原則違反 | 長期的な認証情報は攻撃対象になりやすい |
| 監査困難 | どのサービスがどの権限で操作したか追跡しにくい |

### 目標

AWS IAMロールを使用した一時的な認証情報への移行により：
- 認証情報のハードコーディング排除
- 自動的なキーローテーション
- CloudTrailによる監査証跡の改善
- 最小権限の原則の適用

---

## 前提条件

- [ ] AWSコンソールへの管理者アクセス権限
- [ ] AWS Amplifyホスティング環境の管理権限
- [ ] 本番環境のS3バケット名とリージョンの確認
- [ ] 現在の環境変数設定の確認

---

## 手順

### Phase 1: IAMロールの作成（AWS Console）

#### 1.1 S3アクセス用IAMポリシーの作成

1. AWS Console → IAM → ポリシー → ポリシーの作成
2. JSON タブで以下を入力：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    },
    {
      "Sid": "S3BucketList",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
    }
  ]
}
```

3. ポリシー名: `photo-in-s3-access-policy`
4. 説明: `Photo-in application S3 bucket access for file upload/download`

#### 1.2 Amplify用IAMロールの作成

1. IAM → ロール → ロールの作成
2. 信頼されたエンティティ: **AWS サービス**
3. ユースケース: **Amplify** (または Amplify - Backend Compute)
4. ポリシーをアタッチ: `photo-in-s3-access-policy`
5. ロール名: `photo-in-amplify-s3-role`

#### 1.3 信頼ポリシーの確認

ロール作成後、信頼関係タブで以下を確認：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "amplify.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

---

### Phase 2: Amplify設定の更新

#### 2.1 Amplifyコンソールでの設定

1. AWS Amplify Console → 対象アプリ → App settings → General
2. **Service role** セクションで `photo-in-amplify-s3-role` を選択
3. 保存

#### 2.2 環境変数の更新

Amplify Console → App settings → Environment variables で以下を更新：

| 変数名 | アクション |
|--------|-----------|
| `ACCESS_KEY` | **削除** |
| `SECRET_ACCESS_KEY` | **削除** |
| `REGION` | **維持**（リージョン指定は引き続き必要） |
| `S3_BUCKET_NAME` | **維持** |

---

### Phase 3: フロントエンドコードの修正

#### 3.1 aws/route.ts の修正

**変更前:**
```typescript
// 環境変数の検証
if (!process.env.REGION || !process.env.ACCESS_KEY || !process.env.SECRET_ACCESS_KEY || !process.env.S3_BUCKET_NAME) {
  throw new Error('Required AWS environment variables are not set');
}

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
```

**変更後:**
```typescript
// 環境変数の検証（認証情報は不要、IAMロールから自動取得）
if (!process.env.REGION || !process.env.S3_BUCKET_NAME) {
  throw new Error('Required AWS environment variables are not set: REGION, S3_BUCKET_NAME');
}

// IAMロールからの認証情報を自動的に使用
// Amplify環境ではサービスロールから、ローカルではAWS CLIプロファイルから取得
const s3Client = new S3Client({
  region: process.env.REGION,
  // credentials を省略すると、AWS SDKがIAMロールから自動取得
});
```

#### 3.2 .env.example の更新

```bash
# AWS S3設定
REGION=ap-northeast-1
S3_BUCKET_NAME=your-bucket-name

# 以下は本番環境では不要（IAMロールを使用）
# ローカル開発時のみ設定（または aws configure を使用）
# ACCESS_KEY=your-access-key
# SECRET_ACCESS_KEY=your-secret-key
```

---

### Phase 4: ローカル開発環境の設定

#### 4.1 AWS CLIプロファイルの設定（推奨）

```bash
# AWS CLIで認証情報を設定
aws configure --profile photo-in-dev

# 入力項目
AWS Access Key ID: [開発用アクセスキー]
AWS Secret Access Key: [開発用シークレットキー]
Default region name: ap-northeast-1
Default output format: json
```

#### 4.2 プロファイルの使用

`.env.local` に追加：

```bash
AWS_PROFILE=photo-in-dev
```

または、コード内でプロファイルを指定：

```typescript
import { fromIni } from '@aws-sdk/credential-providers';

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: process.env.NODE_ENV === 'development'
    ? fromIni({ profile: 'photo-in-dev' })
    : undefined,  // 本番ではIAMロールを使用
});
```

---

### Phase 5: テストと検証

#### 5.1 ローカル環境でのテスト

```bash
# 開発サーバー起動
npm run dev

# テスト手順
1. ログイン
2. ファイルアップロード機能をテスト
3. アップロードしたファイルのダウンロードをテスト
4. コンソールでエラーがないことを確認
```

#### 5.2 ステージング環境でのテスト

1. Amplifyにデプロイ
2. 同様のテストを実施
3. CloudWatch Logsでエラーを確認

#### 5.3 本番環境への適用

1. 本番ブランチにマージ
2. Amplifyの自動デプロイを確認
3. 本番環境でテスト実施

---

### Phase 6: クリーンアップ

#### 6.1 古い認証情報の無効化

1. IAM → ユーザー → 対象ユーザー → セキュリティ認証情報
2. 古いアクセスキーを**無効化**（まだ削除しない）
3. 1週間監視後、問題なければ**削除**

#### 6.2 環境変数の削除確認

Amplify Console で以下が削除されていることを確認：
- `ACCESS_KEY`
- `SECRET_ACCESS_KEY`

---

## ロールバック手順

問題が発生した場合の復旧手順：

1. Amplify Console → Environment variables
2. `ACCESS_KEY` と `SECRET_ACCESS_KEY` を再設定
3. `src/app/api/aws/route.ts` を元のコードに戻す
4. 再デプロイ

---

## チェックリスト

### 事前準備
- [ ] 現在の環境変数をバックアップ
- [ ] 開発環境でのテスト環境準備
- [ ] ロールバック手順の確認

### Phase 1: IAMロール作成
- [ ] S3アクセスポリシー作成
- [ ] Amplify用IAMロール作成
- [ ] 信頼ポリシーの確認

### Phase 2: Amplify設定
- [ ] サービスロールの設定
- [ ] 環境変数の更新（ACCESS_KEY, SECRET_ACCESS_KEY削除）

### Phase 3: コード修正
- [ ] aws/route.ts の修正
- [ ] .env.example の更新
- [ ] コードレビュー

### Phase 4: ローカル開発
- [ ] AWS CLIプロファイル設定
- [ ] ローカルテスト成功

### Phase 5: テスト
- [ ] ステージング環境テスト
- [ ] 本番環境テスト

### Phase 6: クリーンアップ
- [ ] 古いアクセスキー無効化
- [ ] 1週間後にアクセスキー削除
- [ ] TODO.mdのSEC-002を完了に更新

---

## 参考リンク

- [AWS SDK for JavaScript v3 - Credential Providers](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html)
- [AWS Amplify - Service Roles](https://docs.aws.amazon.com/amplify/latest/userguide/how-to-service-role-amplify-console.html)
- [IAM Roles for Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
- [Best Practices for Managing AWS Access Keys](https://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html)

---

## 備考

- ECS Fargateを使用している場合は、ECS Task Roleも同様に設定が必要
- Lambda関数がある場合は、Lambda実行ロールにもポリシーをアタッチ
- マルチアカウント環境では、クロスアカウントロールの設定が必要になる場合あり
