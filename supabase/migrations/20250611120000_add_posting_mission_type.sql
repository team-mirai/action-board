-- ポスティングミッション機能の追加

-- 1. mission_artifactsテーブルのartifact_typeにPOSTINGを追加
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT check_artifact_type;

ALTER TABLE public.mission_artifacts
ADD CONSTRAINT check_artifact_type CHECK (
  artifact_type = ANY (
    ARRAY[
      'LINK'::text,
      'TEXT'::text,
      'IMAGE'::text,
      'IMAGE_WITH_GEOLOCATION'::text,
      'REFERRAL'::text,
      'POSTING'::text  -- 新規追加
    ]
  )
);

-- 2. ensure_artifact_dataを更新してPOSTINGタイプを追加
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT ensure_artifact_data;

ALTER TABLE public.mission_artifacts
ADD CONSTRAINT ensure_artifact_data CHECK (
  (
    (
      (artifact_type = 'LINK'::text)
      AND (link_url IS NOT NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'TEXT'::text)
      AND (text_content IS NOT NULL)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
    )
    OR (
      (artifact_type = 'IMAGE'::text)
      AND (image_storage_path IS NOT NULL)
      AND (link_url IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'IMAGE_WITH_GEOLOCATION'::text)
      AND (image_storage_path IS NOT NULL)
      AND (link_url IS NULL)
      AND (text_content IS NULL)
    )
    OR (
      (artifact_type = 'REFERRAL'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NOT NULL)
    )
    OR (
      (artifact_type = 'POSTING'::text)
      AND (link_url IS NULL)
      AND (image_storage_path IS NULL)
      AND (text_content IS NOT NULL)
    )
  )
);

-- 3. ポスティング専用データテーブルの作成
CREATE TABLE posting_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_artifact_id UUID NOT NULL REFERENCES mission_artifacts(id) ON DELETE CASCADE,
    posting_count INTEGER NOT NULL CHECK (posting_count > 0),
    location_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE posting_activities IS 'ポスティング活動の詳細情報';
COMMENT ON COLUMN posting_activities.id IS 'ポスティング活動ID';
COMMENT ON COLUMN posting_activities.mission_artifact_id IS '関連する成果物のID';
COMMENT ON COLUMN posting_activities.posting_count IS 'ポスティングした枚数';
COMMENT ON COLUMN posting_activities.location_text IS 'ポスティング場所（例：東京都世田谷区代田1丁目）';
COMMENT ON COLUMN posting_activities.created_at IS '記録日時(UTC)';
COMMENT ON COLUMN posting_activities.updated_at IS '更新日時(UTC)';

-- 4. インデックスの作成
CREATE INDEX idx_posting_activities_mission_artifact_id ON posting_activities(mission_artifact_id);
CREATE INDEX idx_posting_activities_created_at ON posting_activities(created_at);

-- 5. RLS設定
ALTER TABLE posting_activities ENABLE ROW LEVEL SECURITY;

-- ポスティング活動は作成者のみが閲覧・管理可能
CREATE POLICY "Users can manage their own posting activities"
  ON posting_activities
  FOR ALL
  USING (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT ma.user_id FROM mission_artifacts ma WHERE ma.id = mission_artifact_id
    )
  );

-- 6. ポイント設定管理テーブルの作成
CREATE TABLE mission_point_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_type TEXT NOT NULL UNIQUE,
    points_per_unit INTEGER NOT NULL CHECK (points_per_unit > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE mission_point_settings IS 'ミッションタイプ別ポイント設定';
COMMENT ON COLUMN mission_point_settings.id IS '設定ID';
COMMENT ON COLUMN mission_point_settings.mission_type IS 'ミッションタイプ (POSTING, REFERRAL等)';
COMMENT ON COLUMN mission_point_settings.points_per_unit IS '1単位あたりのポイント';
COMMENT ON COLUMN mission_point_settings.description IS '設定の説明';
COMMENT ON COLUMN mission_point_settings.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN mission_point_settings.updated_at IS '更新日時(UTC)';

-- 7. 初期ポイント設定データ
INSERT INTO mission_point_settings (mission_type, points_per_unit, description)
VALUES ('POSTING', 5, 'ポスティング1枚あたりのポイント');

-- 8. RLS設定
ALTER TABLE mission_point_settings ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは設定を閲覧可能
CREATE POLICY "Authenticated users can view point settings"
  ON mission_point_settings FOR SELECT
  TO authenticated
  USING (true);

-- 管理者のみが設定を作成・更新・削除可能（service_roleでのみアクセス可能）
CREATE POLICY "Only service role can manage point settings"
  ON mission_point_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. ポスティングミッションのサンプル追加
INSERT INTO missions (
    id, 
    title, 
    content, 
    difficulty, 
    required_artifact_type, 
    max_achievement_count,
    artifact_label,
    icon_url,
    ogp_image_url
) VALUES (
    gen_random_uuid(),
    'チームみらいの機関誌をポスティングしよう',
    'チームみらいの機関誌を地域に配布してください。ポスティングした枚数と場所を報告してください。配布1枚につき5ポイントを獲得できます。',
    2, -- 難易度2（Normal）
    'POSTING',
    NULL, -- 無制限（何度でも達成可能）
    'ポスティング情報',
    '/img/mission_fallback.svg',
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp/15_post_institutional_magazine.png'
);
