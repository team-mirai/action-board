# テストユーザー作成ガイド

## 概要

このプロジェクトでは、開発・テスト環境で使用するテストユーザーを作成するためのスクリプトを提供しています。

## 問題の背景

既存の `supabase/seed.sql` で作成されたテストユーザーは、PostgreSQLの `crypt()` 関数を使用してパスワードを暗号化していますが、Supabase Authは独自の内部ハッシュ化方式を使用するため、これらのユーザーではパスワード認証でログインできません。

## 解決方法

`scripts/create-test-users.js` スクリプトは、Supabase Admin APIを使用して正規の認証フローでテストユーザーを作成します。

## 使用方法

### 1. 環境変数の設定

`.env.local` ファイルで以下の環境変数が設定されていることを確認してください：

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. スクリプトの実行

#### 推奨方法: データベースリセット + テストユーザー作成

```bash
npm run db:reset-with-test-users
```

このコマンドは以下を実行します：
1. `supabase db reset` - データベースをリセットし、マイグレーションとseedデータを適用
2. `node scripts/create-test-users.js` - テストユーザーを作成

#### その他の方法

```bash
# データベースリセットのみ
npm run db:reset

# テストユーザーのみ作成
npm run seed:test-users

# 個別実行
node scripts/create-test-users.js
```

## 作成されるテストユーザー

| メールアドレス | パスワード | 名前 | 都道府県 |
|---|---|---|---|
| takahiroanno@example.com | password123 | 安野たかひろ | 東京都 |
| tanaka.hanako@example.com | password123 | 田中花子 | 大阪府 |
| sato.taro@example.com | password123 | 佐藤太郎 | 愛知県 |
| suzuki.misaki@example.com | password123 | 鈴木美咲 | 福岡県 |
| takahashi.ken@example.com | password123 | 高橋健一 | 北海道 |

## スクリプトの機能

- ✅ **既存ユーザーのクリーンアップ**: 重複を避けるため既存のテストユーザーを削除
- ✅ **正規認証フロー**: Supabase Admin APIを使用してユーザーを作成
- ✅ **プロファイル作成**: `private_users` テーブルにユーザー情報を挿入
- ✅ **ログイン検証**: 作成したユーザーで実際にログイン可能か確認
- ✅ **詳細レポート**: 成功・失敗の詳細情報を表示

## トラブルシューティング

### 環境変数エラー

```
❌ 必要な環境変数が設定されていません
```

→ `.env.local` ファイルで `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定してください。

### Supabase未起動エラー

```
Auth ユーザー作成失敗: Database error creating new user
```

→ `npx supabase start` でSupabaseローカル環境を起動してください。

### 権限エラー

Service Role Keyが正しく設定されているか確認してください。ローカル環境では以下の値を使用します：

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## CI/CD統合

GitHub ActionsなどのCI環境では、以下のようにテストユーザーを作成できます：

```yaml
- name: Setup test users
  run: npm run seed:test-users
  env:
    NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```
