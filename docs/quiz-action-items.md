# クイズ機能実装のアクションアイテム

## 完了済み

✅ **データベース設計完了**
- テーブル作成SQL作成（4テーブル + インデックス + RLS）
- 初期データ投入SQL作成（52問のクイズデータ）
- 型定義ファイル作成
- バリデーションスキーマ作成
- サービス層の骨組み作成

## 次に実行すべき手順

### 1. データベースマイグレーション実行

```bash
# ローカル環境でマイグレーションを実行
supabase db reset

# 新しいテーブルが作成されたことを確認
supabase db status
```

### 2. 型定義の再生成

```bash
# 新しいテーブルの型定義を生成
supabase gen types typescript --local > lib/types/supabase.ts
```

### 3. サービス層の修正

- `lib/services/quiz.ts`の型エラーを修正
- 新しい型定義を使用してクエリを修正

### 4. API エンドポイントの実装

以下のAPIエンドポイントを作成：

```
app/api/quiz/
├── categories/
│   └── route.ts              # GET /api/quiz/categories
├── questions/
│   └── route.ts              # GET /api/quiz/questions
├── sessions/
│   ├── route.ts              # POST /api/quiz/sessions
│   └── [sessionId]/
│       ├── answers/
│       │   └── route.ts      # POST /api/quiz/sessions/[id]/answers
│       └── complete/
│           └── route.ts      # POST /api/quiz/sessions/[id]/complete
└── stats/
    └── route.ts              # GET /api/quiz/stats
```

### 5. UIコンポーネントの実装

#### 基本コンポーネント
- `QuizCategoryCard`: カテゴリ選択カード
- `QuizQuestion`: 問題表示コンポーネント
- `QuizOption`: 選択肢コンポーネント
- `QuizProgress`: 進捗表示
- `QuizResult`: 結果表示

#### ページコンポーネント
- `app/quiz/page.tsx`: カテゴリ選択画面
- `app/quiz/[categoryId]/page.tsx`: クイズ実行画面
- `app/quiz/stats/page.tsx`: 統計画面

### 6. ミッション連携

既存のミッションシステムとの統合：

1. **ミッションタイプ追加**
   ```sql
   -- required_artifact_typeにQUIZを追加
   ALTER TABLE missions 
   ADD CONSTRAINT check_artifact_type 
   CHECK (required_artifact_type IN ('LINK', 'TEXT', 'IMAGE', 'IMAGE_WITH_GEOLOCATION', 'NONE', 'REFERRAL', 'QUIZ'));
   ```

2. **クイズミッションの作成**
   ```sql
   INSERT INTO missions (id, title, content, difficulty, required_artifact_type, quiz_config)
   VALUES (
     gen_random_uuid(),
     '公職選挙法クイズ（初級）',
     '公職選挙法に関する基本的な知識を問うクイズです。全3問中2問以上正解でミッション達成！',
     1,
     'QUIZ',
     '{"categoryId": "公職選挙法のカテゴリID", "questionCount": 3, "passingScore": 67}'
   );
   ```

3. **ミッション達成処理の拡張**
   - `app/missions/[id]/actions.ts`にクイズ用の処理を追加
   - クイズ完了時の自動達成処理

### 7. テストの実装

#### E2Eテスト
```typescript
// tests/e2e/quiz.spec.ts
test('クイズの基本フロー', async ({ page }) => {
  await page.goto('/quiz');
  await page.click('[data-testid="category-政策・マニフェスト"]');
  await page.click('[data-testid="start-quiz"]');
  
  // 問題に回答
  await page.click('[data-testid="option-1"]');
  await page.click('[data-testid="next-question"]');
  
  // 結果確認
  await expect(page.locator('[data-testid="quiz-result"]')).toBeVisible();
});
```

#### RLSテスト
```typescript
// tests/rls/quiz.test.ts
describe('Quiz RLS', () => {
  test('ユーザーは自分のセッションのみアクセス可能', async () => {
    // テスト実装
  });
});
```

### 8. パフォーマンス最適化

- **クイズ問題のプリロード**: 次の問題を事前に取得
- **結果のキャッシュ**: 統計情報のキャッシュ
- **画像最適化**: アイコンやバッジ画像の最適化

### 9. 運用準備

- **管理画面**: 問題追加・編集機能
- **分析ダッシュボード**: 利用状況の把握
- **モニタリング**: エラー監視とアラート

## 推定作業時間

- データベース準備: 0.5日 ✅
- API実装: 2日
- UI実装: 3日
- ミッション連携: 1日
- テスト: 1日
- **合計: 約7.5日**

## 優先度

1. **高**: データベース準備 → API実装 → 基本UI
2. **中**: ミッション連携 → 統計機能
3. **低**: 管理機能 → 高度なUI

## 備考

添付画像から確認できるUI要素：
- シンプルで直感的なデザイン
- 明確な進捗表示
- 結果に対する詳細な解説
- ミッション達成時の明確なフィードバック

これらの要素を念頭に置いてUI実装を進めることを推奨します。
