
-- ユーザーテーブル (private)
CREATE TABLE private_users (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address_prefecture VARCHAR(4) NOT NULL,
    x_username VARCHAR(200),
    postcode VARCHAR(7) NOT NULL,
    auth_id UUID NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE private_users IS '認証済みユーザーが登録・更新する個人情報(センシティブ情報を含む)';
COMMENT ON COLUMN private_users.id IS 'ユーザーのUUID。主キー';
COMMENT ON COLUMN private_users.name IS 'ユーザーの氏名';
COMMENT ON COLUMN private_users.address_prefecture IS '都道府県(例：東京都)';
COMMENT ON COLUMN private_users.x_username IS 'X(旧Twitter)のユーザー名。NULL可能';
COMMENT ON COLUMN private_users.postcode IS '郵便番号。ハイフンなしの7桁(例:1000001)';
COMMENT ON COLUMN private_users.auth_id IS 'Supabase Auth のユーザーID';
COMMENT ON COLUMN private_users.created_at IS 'レコード作成日時(UTC)';
COMMENT ON COLUMN private_users.updated_at IS 'レコード更新日時(UTC)';

-- RLS設定
ALTER TABLE private_users ENABLE ROW LEVEL SECURITY;

-- private_usersへの追加は、認証したユーザーのみが行える
CREATE POLICY insert_own_user
  ON private_users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- private_usersへの更新は、認証したユーザーのみが行える
CREATE POLICY update_own_user
  ON private_users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- RLSを設定しているため、SELECTについても設定が必要。
-- private_usersのSELECTは、全てのユーザーが行える。
-- これは後続のVIEWでアクセスできるようにするため。
-- センシティブな情報が入っているので、private_usersテーブルへのSELECTはしないでほしい
CREATE POLICY select_all_users
  ON private_users FOR SELECT
  USING (true);


CREATE VIEW public_users AS
SELECT
    id,
    name,
    address_prefecture,
    x_username,
    created_at
FROM private_users;
COMMENT ON VIEW public_users IS '個人情報テーブルのうち、公開可能なものだけを括り出したView。普段データ表示する際はこちらを利用する';


-- ミッション
CREATE TABLE missions (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    icon_url VARCHAR(500),
    content TEXT,
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

-- ミッション達成
CREATE TABLE achievements (
    mission_id UUID REFERENCES missions(id),
    user_id UUID REFERENCES private_users(id),
    evidence JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (mission_id, user_id)
);

COMMENT ON TABLE achievements IS 'ユーザーによるミッション達成の記録';
COMMENT ON COLUMN achievements.mission_id IS '達成したミッションのID';
COMMENT ON COLUMN achievements.user_id IS 'ミッションを達成したユーザーのID';
COMMENT ON COLUMN achievements.evidence IS '達成の証拠(JSON形式)。達成の証拠が不要な場合は{}を入れる';
COMMENT ON COLUMN achievements.created_at IS '記録日時(UTC)';

-- RLS設定
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーの達成だけを追加できるようにする
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
