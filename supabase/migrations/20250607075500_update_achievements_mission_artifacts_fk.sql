-- 紹介ミッション追加に伴うFK変更。現行影響はなしの想定。

-- 1. 既存の外部キー制約を削除
ALTER TABLE public.achievements
  DROP CONSTRAINT achievements_user_id_fkey;

 --2. 外部キーを public_user_profiles(id) → auth.users(id) に変更して再追加
ALTER TABLE public.achievements
  ADD CONSTRAINT achievements_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 既存の外部キー制約を削除
ALTER TABLE public.mission_artifacts
  DROP CONSTRAINT IF EXISTS mission_artifacts_user_id_fkey;

-- 新しい外部キー制約を追加（auth.users.id を参照）
ALTER TABLE public.mission_artifacts
  ADD CONSTRAINT mission_artifacts_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;