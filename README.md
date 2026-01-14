# ScanSnap to Lark Base Sync Tool

ScanSnap iX2500で読み取った名刺データを、Lark Baseへ自動的に同期するCLIツールです。

## 特徴

- **Shift-JIS対応**: ScanSnap Home出力のShift-JIS（cp932）エンコードされたCSVを正しく読み込み
- **2段階アップロード**:
  1. Lark Drive APIへ画像をアップロードして `file_token` を取得
  2. メタデータと統合してLark Base APIへレコード登録
- **データ変換**: 金額、日付などのフォーマットを自動変換
- **型安全**: TypeScript strict modeで実装
- **高品質**: ESLintエラー0件、テストカバレッジ70%以上

## インストール

```bash
npm install
npm run build
```

## 設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Lark API Configuration
LARK_APP_ID=your_app_id_here
LARK_APP_SECRET=your_app_secret_here
LARK_BASE_ID=your_base_id_here
LARK_TABLE_ID=your_table_id_here

# ScanSnap Configuration
SCANSNAP_CSV_PATH=./data/cards.csv
SCANSNAP_IMAGE_DIR=./data/images
```

### Lark API認証情報の取得

1. [Lark Open Platform](https://open.feishu.cn/)にアクセス
2. 新しいアプリを作成
3. App IDとApp Secretを取得
4. Lark Baseで新しいBaseとTableを作成
5. Base IDとTable IDを確認

## 使用方法

### CLIコマンド

```bash
# 環境変数を使用
npm run dev sync

# コマンドライン引数で指定
npm run dev sync \
  --csv ./data/cards.csv \
  --images ./data/images \
  --app-id YOUR_APP_ID \
  --app-secret YOUR_APP_SECRET \
  --base-id YOUR_BASE_ID \
  --table-id YOUR_TABLE_ID
```

### プログラムから使用

```typescript
import { SyncManager } from 'scansnap-lark-sync';

const config = {
  csvPath: './data/cards.csv',
  imageDir: './data/images',
  larkAppId: 'YOUR_APP_ID',
  larkAppSecret: 'YOUR_APP_SECRET',
  larkBaseId: 'YOUR_BASE_ID',
  larkTableId: 'YOUR_TABLE_ID'
};

const manager = new SyncManager(config);
const successCount = await manager.syncAll();
console.log(`${successCount} records synced`);
```

## CSVフォーマット

ScanSnap Homeから出力されるCSVは、以下のカラムを含む必要があります：

| カラム名（日本語） | カラム名（英語） | 説明 |
|---|---|---|
| 名前 | name | 氏名 |
| 会社名 | company | 会社名 |
| 部署 | department | 部署名 |
| 役職 | position | 役職 |
| メールアドレス | email | メールアドレス |
| 電話番号 | phone | 電話番号 |
| 携帯電話 | mobile | 携帯電話番号 |
| FAX | fax | FAX番号 |
| 郵便番号 | postalCode | 郵便番号 |
| 住所 | address | 住所 |
| URL | url | WebサイトURL |
| 備考 | notes | 備考 |
| 画像パス | imagePath | スキャンした画像のファイル名 |
| スキャン日時 | scanDate | スキャン日時 |

## 開発

### ビルド

```bash
npm run build
```

### テスト

```bash
# テスト実行
npm test

# カバレッジレポート
npm run test:coverage

# Watch mode
npm run test:watch
```

### Lint

```bash
# ESLintチェック
npm run lint

# 自動修正
npm run lint:fix
```

### 型チェック

```bash
npm run typecheck
```

## 技術スタック

- **TypeScript 5.3+**: 型安全な開発
- **Node.js 20+**: ランタイム
- **axios**: HTTP クライアント
- **iconv-lite**: 文字コード変換（Shift-JIS → UTF-8）
- **csv-parse**: CSVパース
- **commander**: CLIフレームワーク
- **vitest**: テストフレームワーク
- **ESLint**: コード品質チェック

## アーキテクチャ

```
src/
├── api/              # Lark API クライアント
│   └── lark-client.ts
├── parsers/          # CSVパーサー
│   └── csv-parser.ts
├── sync/             # 同期マネージャー
│   └── sync-manager.ts
├── types/            # 型定義
│   └── index.ts
├── utils/            # ユーティリティ
│   └── data-transformer.ts
├── cli.ts            # CLIエントリーポイント
└── index.ts          # ライブラリエントリーポイント
```

## ライセンス

MIT

## 貢献

Issue、Pull Requestをお待ちしています！

## サポート

問題が発生した場合は、GitHubのIssueで報告してください
