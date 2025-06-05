
CREATE VIEW user_ranking_view AS
SELECT 
    ul.user_id,
    pup.name,
    pup.address_prefecture,
    ul.xp,
    ul.level,
    ul.updated_at,
    ROW_NUMBER() OVER (ORDER BY ul.xp DESC, ul.updated_at ASC) as rank
FROM user_levels ul
JOIN public_user_profiles pup ON ul.user_id = pup.id
ORDER BY ul.xp DESC, ul.updated_at ASC;

COMMENT ON VIEW user_ranking_view IS '全ユーザーのXPベースランキング';

CREATE VIEW user_ranking_by_level_view AS
SELECT 
    ul.user_id,
    pup.name,
    pup.address_prefecture,
    ul.xp,
    ul.level,
    ul.updated_at,
    ROW_NUMBER() OVER (PARTITION BY ul.level ORDER BY ul.xp DESC, ul.updated_at ASC) as level_rank,
    ROW_NUMBER() OVER (ORDER BY ul.xp DESC, ul.updated_at ASC) as overall_rank
FROM user_levels ul
JOIN public_user_profiles pup ON ul.user_id = pup.id
ORDER BY ul.level DESC, ul.xp DESC, ul.updated_at ASC;

COMMENT ON VIEW user_ranking_by_level_view IS 'レベル別ユーザーランキング';

CREATE VIEW top_10_ranking_view AS
SELECT *
FROM user_ranking_view
WHERE rank <= 10;

COMMENT ON VIEW top_10_ranking_view IS 'トップ10ユーザーランキング（TOPページ用）';

CREATE VIEW top_100_ranking_view AS
SELECT *
FROM user_ranking_view
WHERE rank <= 100;

COMMENT ON VIEW top_100_ranking_view IS 'トップ100ユーザーランキング（ランキングページ用）';

CREATE OR REPLACE FUNCTION get_user_ranking_info(target_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    name VARCHAR(50),
    address_prefecture VARCHAR(4),
    xp INTEGER,
    level INTEGER,
    updated_at TIMESTAMPTZ,
    rank BIGINT
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        urv.user_id,
        urv.name,
        urv.address_prefecture,
        urv.xp,
        urv.level,
        urv.updated_at,
        urv.rank
    FROM user_ranking_view urv
    WHERE urv.user_id = target_user_id;
$$;

COMMENT ON FUNCTION get_user_ranking_info IS '特定ユーザーのランキング情報を取得';

CREATE OR REPLACE FUNCTION get_level_ranking_info(target_level INTEGER, limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    user_id UUID,
    name VARCHAR(50),
    address_prefecture VARCHAR(4),
    xp INTEGER,
    level INTEGER,
    updated_at TIMESTAMPTZ,
    level_rank BIGINT,
    overall_rank BIGINT
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        urblv.user_id,
        urblv.name,
        urblv.address_prefecture,
        urblv.xp,
        urblv.level,
        urblv.updated_at,
        urblv.level_rank,
        urblv.overall_rank
    FROM user_ranking_by_level_view urblv
    WHERE urblv.level = target_level
    ORDER BY urblv.level_rank
    LIMIT limit_count;
$$;

COMMENT ON FUNCTION get_level_ranking_info IS '指定レベルのランキング情報を取得';
