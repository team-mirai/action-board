-- 既存の関数を削除
drop function if exists get_mission_ranking(uuid, integer);
drop function if exists get_user_mission_ranking(uuid, uuid);

-- ミッションランキング関数を再作成（ポイント集計を追加）
create function get_mission_ranking(mission_id uuid, limit_count integer default 10)
returns table (
  user_id uuid,
  user_name text,
  address_prefecture text,
  level int,
  xp int,
  updated_at timestamp,
  clear_count bigint,
  total_points bigint,
  rank bigint
)
language sql
as $$
  with mission_stats as (
    select
      a.user_id,
      count(distinct a.id) as mission_clear_count,
      coalesce(sum(xt.xp_amount), 0) as total_mission_points
    from achievements a
    left join xp_transactions xt on
      xt.user_id = a.user_id and
      xt.source_id = a.id and  -- achievementのIDと比較
      xt.source_type in ('MISSION_COMPLETION', 'BONUS')  -- BONUSも含める
    where a.mission_id = get_mission_ranking.mission_id
    group by a.user_id
  )
  select
    u.id as user_id,
    u.name as user_name,
    u.address_prefecture as address_prefecture,
    r.level as level,
    r.xp as xp,
    r.updated_at as updated_at,
    coalesce(ms.mission_clear_count, 0) as clear_count,
    coalesce(ms.total_mission_points, 0) as total_points,
    rank() over (
      order by 
        coalesce(ms.total_mission_points, 0) desc,
        coalesce(ms.mission_clear_count, 0) desc,
        u.name asc  -- 同点同回数の場合は名前順
    ) as rank
  from public_user_profiles u
  left join user_ranking_view r on u.id = r.user_id
  left join mission_stats ms on u.id = ms.user_id
  where ms.mission_clear_count > 0  -- ミッションをクリアした人のみ表示
  order by rank
  limit get_mission_ranking.limit_count;
$$;

-- ユーザーのミッションランキング関数も再作成
create function get_user_mission_ranking(mission_id uuid, user_id uuid)
returns table (
  user_id uuid,
  user_name text,
  address_prefecture text,
  level int,
  xp int,
  updated_at timestamp,
  clear_count bigint,
  total_points bigint,
  rank bigint
)
language sql
as $$
  with mission_stats as (
    select
      a.user_id,
      count(distinct a.id) as mission_clear_count,
      coalesce(sum(xt.xp_amount), 0) as total_mission_points
    from achievements a
    left join xp_transactions xt on
      xt.user_id = a.user_id and
      xt.source_id = a.id and  -- achievementのIDと比較
      xt.source_type in ('MISSION_COMPLETION', 'BONUS')  -- BONUSも含める
    where a.mission_id = get_user_mission_ranking.mission_id
    group by a.user_id
  ),
  ranked_users as (
    select
      u.id as user_id,
      u.name as user_name,
      u.address_prefecture as address_prefecture,
      r.level as level,
      r.xp as xp,
      r.updated_at as updated_at,
      coalesce(ms.mission_clear_count, 0) as clear_count,
      coalesce(ms.total_mission_points, 0) as total_points,
      rank() over (
        order by 
          coalesce(ms.total_mission_points, 0) desc,
          coalesce(ms.mission_clear_count, 0) desc,
          u.name asc
      ) as rank
    from public_user_profiles u
    left join user_ranking_view r on u.id = r.user_id
    left join mission_stats ms on u.id = ms.user_id
    where ms.mission_clear_count > 0
  )
  select * from ranked_users
  where user_id = get_user_mission_ranking.user_id;
$$;