# クイズ機能の設計と実装ガイド

## 概要

チームみらいのアクションボードにクイズ機能を追加しました。この機能は、政策・マニフェスト、チームみらい、公職選挙法に関する知識を問うクイズを提供し、ミッションの一つとしても利用できます。

## データベース設計

### テーブル構成

1. **quiz_categories**: クイズのカテゴリ管理
2. **quiz_questions**: クイズ問題
3. **quiz_sessions**: クイズセッション（一回の挑戦）
4. **quiz_answers**: 個別の回答記録

### 特徴

- **RLS (Row Level Security)**: ユーザーは自分のセッションと回答のみアクセス可能
- **カテゴリ分類**: 政策・マニフェスト、チームみらい、公職選挙法の3つのカテゴリ
- **難易度設定**: 1-5の難易度レベル
- **詳細な解説**: 各問題に解説付き
- **統計機能**: ユーザーの成績追跡

## ファイル構成

```
lib/
├── types/
│   └── quiz.ts                    # クイズ関連の型定義
└── services/
    └── quiz.ts                    # クイズサービス層（実装予定）

supabase/migrations/
├── 20250615120000_add_quiz_tables.sql     # テーブル作成
└── 20250615130000_insert_quiz_data.sql    # 初期データ投入

app/
└── quiz/                          # クイズ関連ページ（実装予定）
    ├── page.tsx                   # クイズ一覧・カテゴリ選択
    ├── [categoryId]/
    │   └── page.tsx              # カテゴリ別クイズ
    └── session/
        └── [sessionId]/
            └── page.tsx          # クイズ実行画面
```

## 実装手順

### 1. データベースマイグレーション

```bash
# Supabaseローカル環境でマイグレーションを実行
supabase db reset
```

### 2. 型定義の再生成

```bash
# Supabaseの型定義を更新
supabase gen types typescript --local > lib/types/supabase.ts
```

### 3. サービス層の修正

型定義が更新された後、`lib/services/quiz.ts`の型エラーを修正します。

### 4. UI コンポーネントの実装

#### クイズ選択画面
- カテゴリ一覧表示
- 各カテゴリの問題数と平均スコア表示
- 過去の成績表示

#### クイズ実行画面
- 問題表示（1問ずつ）
- 4択の選択肢
- 進捗表示
- 結果画面（スコア、解説）

#### 統計画面
- 全体統計
- カテゴリ別統計
- 最近の成績

### 5. ミッション連携

既存のミッションシステムに統合：
- `required_artifact_type`に`QUIZ`を追加
- クイズ完了時にミッション達成処理
- 合格基準（例：80%以上）の設定

## サンプルデータ

CSVファイルから作成した問題データ：
- 政策・マニフェスト: 15問
- チームみらい: 12問  
- 公職選挙法: 25問

各問題には以下が含まれます：
- 問題文
- 4つの選択肢
- 正解番号
- 詳細な解説
- 難易度レベル

## API エンドポイント設計（予定）

```typescript
// クイズカテゴリ取得
GET /api/quiz/categories

// カテゴリ別問題取得
GET /api/quiz/questions?categoryId=xxx&limit=10

// クイズセッション開始
POST /api/quiz/sessions
{
  categoryId?: string,
  missionId?: string,
  questionCount: number
}

// 回答送信
POST /api/quiz/sessions/{sessionId}/answers
{
  questionId: string,
  answer: number
}

// セッション完了
POST /api/quiz/sessions/{sessionId}/complete

// 統計取得
GET /api/quiz/stats?userId=xxx
```

## セキュリティ考慮事項

1. **正解の隠蔽**: クライアントサイドに正解を送信しない
2. **回答検証**: サーバーサイドで正解判定
3. **セッション管理**: 不正な回答送信を防止
4. **RLS適用**: ユーザーは自分のデータのみアクセス可能

## パフォーマンス最適化

1. **問題のランダム化**: PostgreSQLの`random()`関数使用
2. **インデックス**: 頻繁にクエリされるカラムにインデックス追加済み
3. **キャッシュ**: カテゴリ情報などの静的データをキャッシュ
4. **分離実行**: 重い統計処理は別途実装

## 今後の拡張可能性

1. **タイマー機能**: 制限時間付きクイズ
2. **ランキング**: ユーザー間の成績比較
3. **バッジシステム**: 成績に応じたバッジ付与
4. **問題投稿**: ユーザーからの問題投稿機能
5. **AI解説**: ChatGPTによる詳細解説生成
