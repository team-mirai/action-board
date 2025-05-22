-- ユーザー登録時に情報を保存するテーブル。ユーザー本人のみ追加・閲覧・更新可能
CREATE TABLE private_users (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address_prefecture VARCHAR(4) NOT NULL,
    x_username VARCHAR(200),
    postcode VARCHAR(7) NOT NULL,
    auth_id UUID NOT NULL UNIQUE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE private_users IS '認証済みユーザーが登録・更新する個人情報(センシティブ情報を含む)';
COMMENT ON COLUMN private_users.id IS 'ユーザーのUUID。主キー';
COMMENT ON COLUMN private_users.name IS 'ユーザーの氏名';
COMMENT ON COLUMN private_users.address_prefecture IS '都道府県(例：東京都)';
COMMENT ON COLUMN private_users.x_username IS 'X(旧Twitter)のユーザー名。NULL可能';
COMMENT ON COLUMN private_users.postcode IS '郵便番号。ハイフンなしの7桁(例:1000001) サービス上に露出させない';
COMMENT ON COLUMN private_users.auth_id IS 'Supabase Auth のユーザーID。サービス上に露出させない';
COMMENT ON COLUMN private_users.created_at IS 'レコード作成日時(UTC)';
COMMENT ON COLUMN private_users.updated_at IS 'レコード更新日時(UTC)';

-- RLS設定
ALTER TABLE private_users ENABLE ROW LEVEL SECURITY;
-- private_usersへの追加は、認証したユーザーのみが行える
CREATE POLICY insert_own_user
  ON private_users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);
-- private_usersからの読み込みは、認証したユーザーのみが行える
CREATE POLICY select_own_user
  ON private_users FOR SELECT
  USING (auth.uid() = auth_id);
-- private_usersへの更新は、認証したユーザーのみが行える
CREATE POLICY update_own_user
  ON private_users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);


-- ユーザーの公開プロフィールテーブル、カラム定義はprivate_usersの一部を取り出した形
create table public_user_profiles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  address_prefecture VARCHAR(4) NOT NULL,
  x_username VARCHAR(200),
  created_at timestamptz not null
);

COMMENT ON COLUMN public_user_profiles.id IS 'ユーザーのUUID。主キー。private_users.idと同じ値がセットされる';

-- RLS設定
ALTER TABLE public_user_profiles ENABLE ROW LEVEL SECURITY;
-- すべてのユーザーに読み込みは許可
CREATE POLICY select_all_public_user_profiles
  ON public_user_profiles FOR SELECT
  USING (true);

-- アプリケーション経由からの直接書き込みを禁止し、トリガー関数からのみ更新可能にするポリシー
CREATE POLICY insert_trigger_only_public_user_profiles
  ON public_user_profiles FOR INSERT
  WITH CHECK (current_setting('my.is_trigger', true)::boolean = true);

CREATE POLICY update_trigger_only_public_user_profiles
  ON public_user_profiles FOR UPDATE
  USING (current_setting('my.is_trigger', true)::boolean = true);

-- トリガーで更新
create or replace function sync_public_user_profile()
returns trigger as $$
begin
  -- トリガーからの実行であることを示すカスタム設定を追加
  PERFORM set_config('my.is_trigger', 'true', true);
  
  -- INSERT or UPDATE の場合は upsert
  insert into public_user_profiles (id, name, address_prefecture, x_username, created_at)
  values (new.id, new.name, new.address_prefecture, new.x_username, new.created_at)
  on conflict (id) do update
  set name = excluded.name,
      address_prefecture = excluded.address_prefecture,
      x_username = excluded.x_username,
      created_at = excluded.created_at;

  -- カスタム設定をリセット
  PERFORM set_config('my.is_trigger', 'false', true);
  
  return new;
end;
$$ language plpgsql security definer;  -- SECURITY DEFINERに変更

create trigger trg_sync_public_user_profile
after insert or update on private_users
for each row
execute function sync_public_user_profile();


-- ミッションを保持するテーブル。
CREATE TABLE missions (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    icon_url VARCHAR(500),
    content TEXT,
    difficulty INTEGER NOT NULL,
    event_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE missions IS '達成可能なミッション情報';
COMMENT ON COLUMN missions.id IS 'ミッションID';
COMMENT ON COLUMN missions.title IS 'ミッションのタイトル';
COMMENT ON COLUMN missions.icon_url IS 'アイコン画像URL(NULL可能)';
COMMENT ON COLUMN missions.content IS '説明文(Markdown対応)';
COMMENT ON COLUMN missions.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN missions.updated_at IS '更新日時(UTC)';

-- RLS設定
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_missions
  ON missions FOR SELECT
  USING (true);
-- それ以外は許可しない


-- ミッション達成を保持するテーブル。
CREATE TABLE achievements (
    id UUID PRIMARY KEY,
    mission_id UUID REFERENCES missions(id),
    user_id UUID REFERENCES public_user_profiles(id),
    evidence JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(mission_id, user_id)
);

COMMENT ON TABLE achievements IS 'ユーザーによるミッション達成の記録';
COMMENT ON COLUMN achievements.mission_id IS '達成したミッションのID';
COMMENT ON COLUMN achievements.user_id IS 'ミッションを達成したユーザーのID';
COMMENT ON COLUMN achievements.evidence IS '達成の証拠(JSON形式)。達成の証拠が不要な場合は{}を入れる';
COMMENT ON COLUMN achievements.created_at IS '記録日時(UTC)';

-- RLS設定
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
-- ミッション達成は、その本人だけが追加できる
CREATE POLICY insert_own_achievement
  ON achievements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM private_users
      WHERE private_users.id = achievements.user_id
        AND private_users.auth_id = auth.uid()
    )
  );
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_achievements
  ON achievements FOR SELECT
  USING (true);


-- 活動タイムラインに表示するためのView
CREATE VIEW activity_timeline_view AS
SELECT
  a.id,
  p.id as user_id,
  p.name,
  p.address_prefecture,
  m.title,
  a.created_at
FROM achievements a
JOIN public_user_profiles p ON a.user_id = p.id
JOIN missions m ON a.mission_id = m.id;

-- ミッション達成数を取得するView
CREATE VIEW mission_achievement_count_view AS
SELECT
  m.id as mission_id,
  COUNT(a.id) as achievement_count
FROM missions m
LEFT JOIN achievements a ON m.id = a.mission_id
GROUP BY m.id;

-- イベント
CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE events IS 'イベント情報(外部API取得の可能性あり)';
COMMENT ON COLUMN events.id IS 'イベントID';
COMMENT ON COLUMN events.title IS 'イベント名';
COMMENT ON COLUMN events.url IS '外部イベントURL';
COMMENT ON COLUMN events.starts_at IS '開催日時(UTC)';
COMMENT ON COLUMN events.created_at IS '作成日時(UTC)';
COMMENT ON COLUMN events.updated_at IS '更新日時(UTC)';

-- RLS設定
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_events
  ON events FOR SELECT
  USING (true);


-- 日次アクション数
CREATE TABLE daily_action_summary (
    date DATE PRIMARY KEY,
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE daily_action_summary IS '日単位のアクション件数';
COMMENT ON COLUMN daily_action_summary.date IS '集計日';
COMMENT ON COLUMN daily_action_summary.count IS '累計アクション数';
COMMENT ON COLUMN daily_action_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE daily_action_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_daily_action_summary
  ON daily_action_summary FOR SELECT
  USING (true);


-- 日次ダッシュボード登録人数
CREATE TABLE daily_dashboard_registration_summary (
    date DATE PRIMARY KEY,
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE daily_dashboard_registration_summary IS '日単位のダッシュボード登録人数';
COMMENT ON COLUMN daily_dashboard_registration_summary.date IS '集計日';
COMMENT ON COLUMN daily_dashboard_registration_summary.count IS '累計登録人数';
COMMENT ON COLUMN daily_dashboard_registration_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE daily_dashboard_registration_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_daily_dashboard_registration_summary
  ON daily_dashboard_registration_summary FOR SELECT
  USING (true);


-- 週次イベント開催数
CREATE TABLE weekly_event_count_summary (
    date DATE PRIMARY KEY,
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE weekly_event_count_summary IS '週単位のイベント開催数';
COMMENT ON COLUMN weekly_event_count_summary.date IS '集計日(週単位)';
COMMENT ON COLUMN weekly_event_count_summary.count IS '累計イベント開催数';
COMMENT ON COLUMN weekly_event_count_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE weekly_event_count_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_weekly_event_count_summary
  ON weekly_event_count_summary FOR SELECT
  USING (true);


-- 日次都道府県ごとのダッシュボード登録人数
CREATE TABLE daily_dashboard_registration_by_prefecture_summary (
    date DATE,
    prefecture VARCHAR(4),
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (date, prefecture)
);

COMMENT ON TABLE daily_dashboard_registration_by_prefecture_summary IS '日単位の都道府県別ダッシュボード登録人数';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.date IS '集計日';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.prefecture IS '都道府県名';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.count IS '登録人数';
COMMENT ON COLUMN daily_dashboard_registration_by_prefecture_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE daily_dashboard_registration_by_prefecture_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_daily_dashboard_registration_by_prefecture_summary
  ON daily_dashboard_registration_by_prefecture_summary FOR SELECT
  USING (true);


-- 週次都道府県ごとのイベント開催数
CREATE TABLE weekly_event_count_by_prefecture_summary (
    date DATE,
    prefecture VARCHAR(4),
    count INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (date, prefecture)
);

COMMENT ON TABLE weekly_event_count_by_prefecture_summary IS '週単位の都道府県別イベント開催数';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.date IS '集計日';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.prefecture IS '都道府県名';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.count IS 'イベント開催数';
COMMENT ON COLUMN weekly_event_count_by_prefecture_summary.created_at IS '作成日時(UTC)';

-- RLS設定
ALTER TABLE weekly_event_count_by_prefecture_summary ENABLE ROW LEVEL SECURITY;
-- SELECTはすべてのユーザーに許可（匿名ユーザーも含む）
CREATE POLICY select_all_weekly_event_count_by_prefecture_summary
  ON weekly_event_count_by_prefecture_summary FOR SELECT
  USING (true);
