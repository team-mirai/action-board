
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
