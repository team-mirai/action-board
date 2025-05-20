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