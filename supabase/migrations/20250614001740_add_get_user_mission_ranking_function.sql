create or replace function get_user_mission_ranking(mission_id uuid, user_id uuid)
returns table (
  user_id uuid,
  user_name text,
  address_prefecture text,
  level int,
  xp int,
  updated_at timestamp,
  clear_count bigint,
  rank bigint
)
language sql
as $$
  with mission_achievements as (
    select
      a.user_id,
      count(a.id) as mission_clear_count
    from achievements a
    where a.mission_id = get_user_mission_ranking.mission_id
    group by a.user_id
  ),
  user_rankings as (
    select
      u.id as user_id,
      u.name as user_name,
      u.address_prefecture as address_prefecture,
      r.level as level,
      r.xp as xp,
      r.updated_at as updated_at,
      coalesce(ma.mission_clear_count, 0) as clear_count,
      rank() over (order by coalesce(ma.mission_clear_count, 0) desc) as rank
    from public_user_profiles u
    left join user_ranking_view r on u.id = r.user_id
    left join mission_achievements ma on u.id = ma.user_id
  )
  select *
  from user_rankings
  where user_id = get_user_mission_ranking.user_id
$$; 