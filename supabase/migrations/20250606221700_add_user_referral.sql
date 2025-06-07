-- ユーザー別リファラルコード（紹介ミッション用）を保持するテーブルの作成

create table user_referral (
  user_id uuid primary key references auth.users(id) on delete cascade,
  referral_code char(8) not null unique,
  del_flg boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table user_referral enable row level security;

create policy "Users can SELECT their own referral" on user_referral
for select
using (auth.uid() = user_id);

create policy "Users can INSERT their own referral" on user_referral
for insert
with check (auth.uid() = user_id);