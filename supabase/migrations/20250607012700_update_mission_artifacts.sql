-- mission_artifactsのcheck_artifact_typeに'REFERRAL'を追加

-- 一度 check_artifact_typeをDROP
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT check_artifact_type;

-- REFFERALを追加して再生成
ALTER TABLE public.mission_artifacts
ADD CONSTRAINT check_artifact_type CHECK (
  artifact_type = ANY (
    ARRAY[
      'LINK'::text,
      'TEXT'::text,
      'IMAGE'::text,
      'IMAGE_WITH_GEOLOCATION'::text,
      'REFERRAL'::text  -- ★追加
    ]
  )
);

-- 一度ensure_artifact_dataをDROP
ALTER TABLE public.mission_artifacts
DROP CONSTRAINT ensure_artifact_data;

-- REFFERALを追加して再生成
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
  )
);
