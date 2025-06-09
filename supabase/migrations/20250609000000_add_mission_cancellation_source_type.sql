-- XP取引のsource_typeにMISSION_CANCELLATIONを追加
-- ミッション提出取り消し時のXP減算用

-- 既存のCHECK制約を削除
ALTER TABLE xp_transactions
DROP CONSTRAINT IF EXISTS xp_transactions_source_type_check;

-- 新しいCHECK制約を追加（MISSION_CANCELLATIONを含む）
ALTER TABLE xp_transactions
ADD CONSTRAINT xp_transactions_source_type_check
CHECK (source_type IN ('MISSION_COMPLETION', 'BONUS', 'PENALTY', 'MISSION_CANCELLATION'));

COMMENT ON CONSTRAINT xp_transactions_source_type_check ON xp_transactions IS 'MISSION_COMPLETION: ミッション達成時のXP付与, BONUS: ボーナスXP付与, PENALTY: 罰則によるXP減算, MISSION_CANCELLATION: ミッション提出取り消しによるXP減算';