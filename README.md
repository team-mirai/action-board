# アクションボード

## 必要な環境

- Node.js  
  - Macの場合 `brew install node` でインストール
- Docker  
- Supabase CLI  
  - Macの場合 `brew install supabase/tap/supabase` でインストール

## サービスの起動方法

1. Supabase のローカル環境を起動

   ```bash
   supabase start
   ````

2. `.env.example` を `.env.local` にリネームし、以下の値を更新:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[`supabase start` 実行後に表示される SUPABASE プロジェクトの API ANON KEY を入力]

   # ローカル開発時は http://localhost:54323/ にアクセスして Cmd+K でコマンドメニューから 「Copy service API key」 で取得できます。
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. ローカルデータベースの初期化:

   ```bash
   supabase db reset
   ```

  supabase/migrations以下にあるマイグレーションを実行し、supabase/seed.sqlにあるシードデータをローカルデータベースに流し込みみます。


4. Next.js のローカル開発サーバーを起動:

   ```bash
   npm run dev
   ```

   サービスは [localhost:3000](http://localhost:3000/) でアクセス可能になります。



## サービスの使い方

### 認証ユーザーの作成

ローカルでサービスにログインできるユーザーとなるために、ユーザー登録が必要です。

1. [ローカル Supabase Studio](http://localhost:54323/) から新しいsupabase認証ユーザーを作成

* 「Authentication」メニューを開く
* 「Add user」ボタンをクリックし、「Create new user」を選択
* メールアドレスとパスワードを入力(開発用なのでパスワードは任意です)

2. supabase認証ユーザーレコードのID をメモし、サービスのユーザー情報である`private_users` テーブルにレコードを追加

* 「Table Editor」メニューを開く
* `private_users` テーブルを選択
* 「Insert」ボタンをクリックし、「Insert row」を選択
* 「id」欄に先ほど作成したsupabase認証ユーザーの ID を入力
* その他の欄はよしなに入力する


## 開発ガイドライン

migrationファイルの追加や編集で、テーブルの追加や更新を行った場合は、型定義を生成してください。

```
npx supabase gen types typescript --local > utils/types/supabase.ts
```

## E2Eテスト

このプロジェクトでは、Playwrightを使用したE2Eテストを実装しています。テストは`tests/e2e`ディレクトリに配置されています。

### テストの実行方法

1. テスト実行前に、ローカル開発環境が起動していることを確認してください:

   ```bash
   supabase start
   ```

2. 以下のコマンドですべてのテストを実行できます:

   ```bash
   npm run test:e2e
   ```

3. 特定のテストファイルのみを実行する場合:

   ```bash
   npm run test:e2e -- tests/e2e/auth.spec.ts
   ```

4. 特定のプロジェクト（ブラウザ/デバイス）でのみテストを実行する場合:

   ```bash
   # デスクトップブラウザ
   npm run test:e2e -- --project=chromium
   npm run test:e2e -- --project=firefox
   npm run test:e2e -- --project=webkit
   
   # モバイルデバイス
   npm run test:e2e -- --project=mobile-chrome
   npm run test:e2e -- --project=mobile-safari
   ```

5. UIモードでテストを実行する場合（デバッグに便利）:

   ```bash
   npm run test:e2e:ui
   ```

### テストレポートの確認

テスト実行後、HTMLレポートが生成されます。以下のコマンドで確認できます:

```bash
npx playwright show-report
```

### テストの追加方法

新しいテストを追加する場合は、以下のファイル構造に従ってください:

- `tests/e2e/`: すべてのE2Eテストファイルを配置
- `tests/e2e-test-helpers.ts`: テスト用のヘルパー関数と拡張されたテストフィクスチャ

テストファイル命名規則: `機能名.spec.ts`

### storybookの実行

```bash
npm run storybook
```

`stories`ディレクトリにstorybookのファイルを配置してください。