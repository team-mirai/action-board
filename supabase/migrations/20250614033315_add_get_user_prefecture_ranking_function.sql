-- Create a function to get a specific user's prefecture ranking
create or replace function get_user_prefecture_ranking(prefecture text, target_user_id uuid)
returns table (
  user_id uuid,
  user_name text,
  address_prefecture text,
  rank bigint,
  level integer,
  xp integer,
  updated_at timestamptz
) language sql as $$
  with ranked_users as (
    select 
      u.id as user_id,
      u.name as user_name,
      u.address_prefecture,
      r.level,
      r.xp,
      r.updated_at,
      rank() over (order by r.xp desc, r.updated_at desc) as rank
    from public_user_profiles u
    left join user_ranking_view r on u.id = r.user_id
    where u.address_prefecture = get_user_prefecture_ranking.prefecture
  )
  select 
    ranked_users.user_id,
    ranked_users.user_name,
    ranked_users.address_prefecture,
    ranked_users.rank,
    ranked_users.level,
    ranked_users.xp,
    ranked_users.updated_at
  from ranked_users
  where ranked_users.user_id = get_user_prefecture_ranking.target_user_id
  order by ranked_users.rank;
$$;