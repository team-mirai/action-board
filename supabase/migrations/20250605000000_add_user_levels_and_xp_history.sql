-- ユーザーレベルシステムとXP履歴テーブルの作成

-- user_levelsテーブルの作成
CREATE TABLE user_levels (
    user_id UUID PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL CHECK (xp >= 0) DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_levels IS 'ユーザーの経験値とレベル情報';
COMMENT ON COLUMN user_levels.user_id IS 'ユーザーID (auth.users.idを参照)';
COMMENT ON COLUMN user_levels.xp IS '累計経験値';
COMMENT ON COLUMN user_levels.level IS '現在のレベル';
COMMENT ON COLUMN user_levels.updated_at IS '最終更新日時(UTC)';

-- user_levelsのインデックス
CREATE INDEX user_levels_xp_desc_idx
    ON user_levels (xp DESC, updated_at);

-- XP獲得履歴テーブルの作成
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    xp_amount INTEGER NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('MISSION_COMPLETION', 'BONUS', 'PENALTY')),
    source_id UUID, -- ミッション達成IDなど、ソースに応じたID
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE xp_transactions IS 'XP獲得・消費の履歴';
COMMENT ON COLUMN xp_transactions.id IS 'トランザクションID';
COMMENT ON COLUMN xp_transactions.user_id IS 'ユーザーID';
COMMENT ON COLUMN xp_transactions.xp_amount IS 'XP増減量（正数で獲得、負数で消費）';
COMMENT ON COLUMN xp_transactions.source_type IS 'XP獲得源の種類';
COMMENT ON COLUMN xp_transactions.source_id IS 'ソースとなったレコードのID（ミッション達成IDなど）';
COMMENT ON COLUMN xp_transactions.description IS 'XP獲得の詳細説明';
COMMENT ON COLUMN xp_transactions.created_at IS '記録日時(UTC)';

-- xp_transactionsのインデックス
CREATE INDEX xp_transactions_user_id_idx ON xp_transactions(user_id);
CREATE INDEX xp_transactions_created_at_idx ON xp_transactions(created_at DESC);
CREATE INDEX xp_transactions_source_idx ON xp_transactions(source_type, source_id);

-- RLS設定
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- user_levelsのRLSポリシー
-- 自分のレベル情報は閲覧・更新可能
CREATE POLICY "Users can view their own level"
    ON user_levels FOR SELECT
    USING (auth.uid() = user_id);

-- 他のユーザーのレベル情報も参照可能（ランキング表示などのため）
CREATE POLICY "All users can view other user levels"
    ON user_levels FOR SELECT
    USING (true);

-- xp_transactionsのRLSポリシー
-- 自分のXP履歴は閲覧可能
CREATE POLICY "Users can view their own xp transactions"
    ON xp_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- XP付与はサービス層で実装
