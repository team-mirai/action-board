-- missionsテーブルにフューチャードフラグを追加

alter table public.missions
add column is_featured boolean not null default false;