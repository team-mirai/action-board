# Tech Context - Action Board

## 使用されている技術

### フロントエンド技術

#### Next.js 15.3.2
- **App Router**: ファイルベースルーティング
- **Server Components**: サーバーサイドレンダリング
- **Server Actions**: フォーム処理の簡素化
- **React 19.1.0**: 最新のReact機能

#### スタイリング
- **Tailwind CSS**: ユーティリティファーストCSS
- **Radix UI**: アクセシブルなUIコンポーネント
  - Accordion, Avatar, Dialog, Select など
- **Lucide React**: アイコンライブラリ
- **clsx**: 条件付きクラス名の管理

#### 状態管理・バリデーション
- **Zod 3.25.23**: スキーマバリデーション
- **React Hook Form**: (将来使用予定)

### バックエンド技術

#### Supabase
- **Database**: PostgreSQL with extensions
- **Authentication**: JWT-based auth
- **Storage**: ファイルアップロード・管理
- **Real-time**: リアルタイムサブスクリプション
- **RLS**: Row Level Security

#### API設計
- **RESTful**: Supabase自動生成API
- **GraphQL**: (将来検討中)

### 開発・ビルドツール

#### パッケージマネージャー・ビルド
- **npm**: 依存関係管理
- **Next.js**: ビルド・バンドル
- **TypeScript**: 型安全性

#### コード品質
- **Biome 1.9.4**: Linting + Formatting
  - ESLint + Prettier の代替
- **Lefthook**: Git hooks管理

#### テスト
- **Playwright 1.52.0**: E2Eテスト
- **Jest**: RLSテスト
- **@storybook/**: コンポーネントドキュメント

### インフラ・デプロイ

#### CI/CD
- **Google Cloud Build**: 自動ビルド・デプロイ
- **GitHub Actions**: コード品質チェック
- **Docker**: コンテナ化

#### モニタリング
- **Sentry 9.22.0**: エラートラッキング
- **Instrumentation**: OpenTelemetry準備

#### ホスティング
- **Google Cloud Platform**: 本番環境（推定）
- **Supabase**: データベース・認証

## 開発環境のセットアップ

### 必要な環境
```bash
# 基本ツール
- Node.js (LTS)
- Docker
- Git

# macOS
brew install node
brew install docker
brew install supabase/tap/supabase

# 依存関係インストール
npm install
```

### 環境変数設定
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

### 開発サーバー起動
```bash
# データベース起動
supabase start

# データベースリセット（マイグレーション実行）
supabase db reset

# 開発サーバー起動
npm run dev
```

### データベース型生成
```bash
# Supabaseからの型定義生成
npm run types
# または
supabase gen types typescript --local > lib/types/supabase.ts
```

## 技術的制約

### パフォーマンス制約
- **画像ファイル**: 最大10MB
- **署名付きURL**: 60秒有効期限
- **画像最適化**: 240x240px自動リサイズ

### セキュリティ制約
- **認証**: Supabase JWTのみ
- **ファイルアクセス**: ユーザー分離必須
- **データアクセス**: RLS強制

### ブラウザサポート
- **モダンブラウザ**: ES2015+対応
- **モバイル**: PWA対応予定

## 依存関係詳細

### プロダクション依存関係
```json
{
  "@radix-ui/react-*": "UI コンポーネント群",
  "@sentry/nextjs": "エラーモニタリング",
  "@supabase/ssr": "サーバーサイドレンダリング対応",
  "@supabase/supabase-js": "Supabaseクライアント",
  "autoprefixer": "CSS自動プリフィックス",
  "class-variance-authority": "条件付きスタイリング",
  "clsx": "クラス名結合",
  "date-fns": "日付操作",
  "lucide-react": "アイコン",
  "next": "フレームワーク",
  "next-themes": "テーマ切り替え",
  "react": "UIライブラリ",
  "sonner": "トースト通知",
  "zod": "バリデーション"
}
```

### 開発依存関係
```json
{
  "@biomejs/biome": "Linter + Formatter",
  "@playwright/test": "E2E テスト",
  "@storybook/": "コンポーネントドキュメント",
  "@types/": "TypeScript型定義",
  "jest": "ユニットテスト",
  "jest-junit": "JUnit形式レポート",
  "lefthook": "Git hooks",
  "prettier-plugin-tailwindcss": "Tailwind CSS整形",
  "tailwindcss": "CSS フレームワーク",
  "typescript": "型システム"
}
```

## アーキテクチャ選択の理由

### Next.js App Router選択理由
1. **Server Components**: 初期ロード高速化
2. **File-based Routing**: 直感的なルーティング
3. **Server Actions**: API endpoints不要
4. **TypeScript統合**: 型安全性の向上

### Supabase選択理由
1. **開発速度**: バックエンド開発不要
2. **PostgreSQL**: リレーショナルデータベース
3. **RLS**: 組み込みセキュリティ
4. **リアルタイム**: 即座のデータ同期

### Biome選択理由
1. **高速**: ESLint + Prettierより高速
2. **統一**: 設定ファイルの簡素化
3. **TypeScript**: ネイティブサポート

## 今後の技術的発展

### 短期計画（3ヶ月）
- **PWA対応**: サービスワーカー実装
- **画像最適化強化**: WebP形式対応
- **キャッシュ戦略**: ISR活用

### 中期計画（6ヶ月）
- **リアルタイム機能**: Supabaseリアルタイム活用
- **Push通知**: ブラウザ通知
- **オフライン対応**: データ同期機能

### 長期計画（1年）
- **マイクロサービス**: 機能別分離検討
- **GraphQL**: API統合検討
- **機械学習**: レコメンデーション機能

## パフォーマンス監視

### メトリクス
- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Size**: 自動監視
- **Database Performance**: Supabase insights

### 監視ツール
- **Sentry**: エラー・パフォーマンス
- **Lighthouse**: 定期的な品質チェック
- **Bundle Analyzer**: バンドルサイズ分析

## セキュリティ対策

### データ保護
- **HTTPS**: 全通信暗号化
- **JWT**: トークンベース認証
- **CORS**: 適切なオリジン制御

### 入力検証
- **Client Side**: UX向上のための即座検証
- **Server Side**: Zod schema必須
- **Database**: 制約・RLSによる最終防御

### ファイルセキュリティ
- **MIME Type**: 許可リスト方式
- **ファイルサイズ**: 厳格な制限
- **ウイルススキャン**: 将来実装予定

---

**最終更新**: 2025-06-05  
**更新者**: GitHub Copilot
