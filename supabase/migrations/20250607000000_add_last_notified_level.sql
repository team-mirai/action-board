-- user_levelsテーブルに最終通知レベル列を追加
-- レベルアップ通知システムのために使用

ALTER TABLE user_levels ADD COLUMN last_notified_level INTEGER DEFAULT 1;

COMMENT ON COLUMN user_levels.last_notified_level IS 'ユーザーが最後に通知を受けたレベル（重複通知を防ぐため）';

-- 既存レコードはデフォルト値の1が設定される
-- （全ユーザーにレベルアップ通知を表示する）
