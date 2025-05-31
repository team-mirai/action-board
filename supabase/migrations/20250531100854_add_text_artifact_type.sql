-- TEXT成果物タイプをサポートするためのマイグレーション

-- mission_artifactsテーブルにtext_contentカラムを追加
ALTER TABLE mission_artifacts ADD COLUMN text_content TEXT;

-- artifact_typeのチェック制約を更新してTEXTタイプを追加
ALTER TABLE mission_artifacts DROP CONSTRAINT check_artifact_type;
ALTER TABLE mission_artifacts ADD CONSTRAINT check_artifact_type 
    CHECK (artifact_type IN ('LINK', 'TEXT', 'IMAGE', 'IMAGE_WITH_GEOLOCATION'));

-- ensure_link_or_image制約を更新してTEXTタイプを含める
ALTER TABLE mission_artifacts DROP CONSTRAINT ensure_link_or_image;
ALTER TABLE mission_artifacts ADD CONSTRAINT ensure_artifact_data CHECK (
    (artifact_type = 'LINK' AND link_url IS NOT NULL AND image_storage_path IS NULL AND text_content IS NULL) OR
    (artifact_type = 'TEXT' AND text_content IS NOT NULL AND link_url IS NULL AND image_storage_path IS NULL) OR
    (artifact_type = 'IMAGE' AND image_storage_path IS NOT NULL AND link_url IS NULL AND text_content IS NULL) OR
    (artifact_type = 'IMAGE_WITH_GEOLOCATION' AND image_storage_path IS NOT NULL AND link_url IS NULL AND text_content IS NULL)
);

-- mission_artifacts.text_contentカラムのコメントを追加
COMMENT ON COLUMN mission_artifacts.text_content IS '成果物がテキストの場合のテキスト内容';

-- missionsテーブルのrequired_artifact_typeコメントを更新
COMMENT ON COLUMN missions.required_artifact_type IS 'ミッション達成に必要な成果物の種類 (LINK, TEXT, IMAGE, NONE)';