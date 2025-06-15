# System Patterns - Action Board

## システムアーキテクチャ

### 全体アーキテクチャ
```
Frontend (Next.js 15.3.2)
├── App Router (/app)
├── Server Components
├── Client Components
└── Server Actions

Backend Services
├── Supabase Database (PostgreSQL)
├── Supabase Auth (JWT)
├── Supabase Storage (Files)
└── Supabase RLS (Security)

External Services
├── Sentry (Monitoring)
└── Google Cloud Build (CI/CD)
```

### レイヤー分離設計

#### 1. プレゼンテーション層
- **ページコンポーネント** (`/app/**/page.tsx`)
- **レイアウトコンポーネント** (`/app/**/layout.tsx`)
- **UIコンポーネント** (`/components/ui/`)
- **ビジネスコンポーネント** (`/components/mission/`)

#### 2. ビジネスロジック層
- **Server Actions** (`/app/**/actions.ts`)
- **Hooks** (`/app/**/_hooks/`)
- **Validation Schemas** (Zod schemas)

#### 3. データアクセス層
- **データ取得関数** (`/app/**/_lib/data.ts`)
- **型定義** (`/lib/types/`)
- **Supabaseクライアント** (`/lib/supabase/`)

## 重要な技術的決定

### 1. データベース設計パターン

#### RLS (Row Level Security) 中心設計
```sql
-- 例: 成果物の所有者のみアクセス可能
CREATE POLICY "Users can manage their own mission artifacts"
  ON mission_artifacts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**採用理由**:
- アプリケーションレイヤーでのセキュリティバグを防止
- データベースレベルでの確実なアクセス制御
- 開発効率と安全性の両立

#### CHECK制約による整合性保証
```sql
CONSTRAINT ensure_artifact_data CHECK (
    (artifact_type = 'LINK' AND link_url IS NOT NULL AND image_storage_path IS NULL AND text_content IS NULL) OR
    (artifact_type = 'TEXT' AND text_content IS NOT NULL AND link_url IS NULL AND image_storage_path IS NULL) OR
    -- ... 他のタイプ
);
```

**採用理由**:
- 成果物タイプとデータの整合性をデータベースレベルで保証
- アプリケーションの論理エラーを防止
- データの信頼性向上

### 2. フロントエンド設計パターン

#### Server Components First アプローチ
- **デフォルト**: Server Components使用
- **必要時のみ**: `"use client"`でClient Components
- **データフェッチ**: Server Componentsで実行

**採用理由**:
- 初期ロード時間の短縮
- SEOの最適化
- サーバーサイドでのセキュアなデータアクセス

#### Discriminated Union によるタイプセーフティ
```typescript
const achieveMissionFormSchema = z.discriminatedUnion("requiredArtifactType", [
  linkArtifactSchema,
  textArtifactSchema,
  imageArtifactSchema,
  imageWithGeolocationArtifactSchema,
  noneArtifactSchema,
]);
```

**採用理由**:
- 成果物タイプごとの異なるバリデーション要件への対応
- コンパイル時のタイプエラー検出
- 実行時の安全性確保

### 3. ファイル管理パターン

#### ユーザー分離Storage構造
```
mission_artifact_files/
├── {user_id}/
│   ├── {achievement_id}/
│   │   └── {file_name}
│   └── ...
└── ...
```

**採用理由**:
- ユーザーごとのファイル分離
- 削除時のカスケード制御
- プライバシー保護

#### 署名付きURL + 画像最適化
```typescript
const { data: signedUrlData } = await supabase.storage
  .from("mission_artifact_files")
  .createSignedUrl(artifact.image_storage_path, 60, {
    transform: {
      width: 240,
      height: 240,
      resize: "contain",
    },
  });
```

**採用理由**:
- セキュアなファイルアクセス
- 自動的な画像最適化
- 帯域幅の節約

## 使用中の設計パターン

### 1. Repository パターン（変形版）
**実装**: `_lib/data.ts` ファイル
- `getMissionData()`
- `getUserAchievements()`  
- `getSubmissionHistory()`

**特徴**:
- Server Components内で直接呼び出し
- Supabaseクライアントのラッパー
- 型安全なデータアクセス

### 2. Factory パターン
**実装**: `artifactTypes.ts`
```typescript
export function getArtifactConfig(
  typeKey: ArtifactTypeKey | string | undefined | null,
): ArtifactConfig | undefined {
  // 設定オブジェクトの生成
}
```

**用途**: 成果物タイプごとの設定オブジェクト生成

### 3. Observer パターン（React版）
**実装**: `useMissionSubmission` hook
- ミッション状態の監視
- UI状態の自動更新
- 依存関係の管理

### 4. Command パターン
**実装**: Server Actions
- `achieveMissionAction`
- `cancelSubmissionAction`

**特徴**:
- 非同期処理のカプセル化
- エラーハンドリングの統一
- トランザクション境界の明確化

### 5. Composite パターン
**実装**: UIコンポーネント構造
```typescript
<MissionFormWrapper>
  <ArtifactForm>
    <ImageUploader />
    <GeolocationInput />
  </ArtifactForm>
  <SubmitButton />
</MissionFormWrapper>
```

### 6. バッチ処理パターン

#### Client-Side QRコード生成
```typescript
import QRCode from "react-qr-code";

export default function QRCodeDisplay({ value }: Props) {
  return (
    <div className="flex justify-center p-4 bg-white">
      <QRCode value={value} size={160} />
    </div>
  );
}
```

**採用理由**:
- クライアントサイドでの軽量な実装
- リアルタイムでのQRコード生成
- サーバーサイドレンダリングとの適切な分離

#### 紹介システムアーキテクチャ
```typescript
// 紹介コード生成とバリデーション
const referralCode = nanoid(8); // 8桁ランダムコード

// 重複処理の安全な実装
for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
  const { error } = await supabase
    .from("user_referral")
    .insert({ user_id, referral_code });
  
  if (!error) break;
  if (error.code !== "23505") throw error; // 重複以外はエラー
}
```

**設計特徴**:
- 冪等性を保証するリトライ機能
- ユニーク制約違反の適切な処理
- セキュアなランダムコード生成

#### 管理者認証による安全な実行
```typescript
// 環境変数による簡易認証
if (adminKey !== process.env.BATCH_ADMIN_KEY) {
  return NextResponse.json(
    { error: "認証に失敗しました" },
    { status: 401 }
  );
}
```

**採用理由**:
- 管理者のみがバッチ処理を実行可能
- 環境変数による設定の柔軟性
- 簡潔で確実な認証メカニズム

#### 冪等性とエラー耐性
```typescript
// 既存のXPトランザクションをチェック
const { data: existingXp } = await supabase
  .from("xp_transactions")
  .select("id")
  .eq("source_type", "MISSION_COMPLETION")
  .eq("source_id", achievement.id)
  .maybeSingle();

if (!existingXp) {
  // XPが未付与の場合のみ処理
  missingXpAchievements.push(achievement);
}
```

**採用理由**:
- 重複実行しても安全な冪等性
- 個別失敗時も他の処理を継続
- データ整合性の確実な保証

#### 統計とモニタリング
- **事前確認**: GET エンドポイントで処理対象の統計確認
- **詳細レポート**: 成功・失敗・スキップの詳細記録
- **プログレス管理**: レート制限と進捗ログ出力

**採用理由**:
- 大規模データ処理の安全性確保
- 問題発生時の迅速な原因特定
- 運用チームへの透明な情報提供

## コンポーネントの関係

### データフロー図
```
Page Component
├── Data Fetching (Server)
├── MissionDetails (Presentation)
├── MissionFormWrapper (Container)
│   ├── ArtifactForm (Business Logic)
│   │   ├── ImageUploader (Feature)
│   │   └── GeolocationInput (Feature)
│   └── SubmitButton (UI)
└── SubmissionHistory (Presentation)
```

### 状態管理パターン
- **Server State**: Supabaseからの直接フェッチ
- **Client State**: React useState/useRef
- **Form State**: FormData + Server Actions
- **URL State**: Next.js Router

### エラーハンドリング階層
1. **Database Level**: CHECK制約、RLS
2. **Server Action Level**: Zodバリデーション
3. **Component Level**: エラー表示、フォールバック
4. **Global Level**: Error Boundary、Sentry

## パフォーマンス最適化パターン

### 1. データフェッチ最適化
- **Parallel Fetching**: 複数データの並行取得
- **Select Optimization**: 必要カラムのみ取得
- **View Usage**: 集計処理のView活用

### 2. 画像最適化
- **Lazy Loading**: 署名付きURL生成の遅延
- **Image Transform**: Supabase組み込み機能使用
- **Cache Control**: 適切なCache-Control設定

### 3. レンダリング最適化
- **Server Components**: 初期レンダリングの高速化
- **Streaming**: Suspenseによる段階的ロード
- **Component Splitting**: 必要な部分のみ再レンダリング

## セキュリティパターン

### 1. 多層防御
```
Frontend Validation (UX)
├── Zod Schema (Logic)
├── Database Constraints (Data)
└── RLS Policies (Access)
```

### 2. 最小権限の原則
- **Authentication**: Supabase JWT
- **Authorization**: RLS Policy
- **Data Access**: 必要最小限のカラム

### 3. 入力サニタイゼーション
- **Server Actions**: FormData検証
- **Database**: Parameterized Queries
- **File Upload**: MIME Type制限

---

**最終更新**: 2025-06-11  
**更新者**: GitHub Copilot
