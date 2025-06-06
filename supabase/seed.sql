-- auth.usersテーブルにユーザーを追加（外部キー制約のため）
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'takahiroanno@example.com', crypt('password123', gen_salt('bf')), now(), now(), now());

DO $$
DECLARE
    surnames TEXT[] := ARRAY['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山田', '中村', '小林', '加藤'];
    given_names TEXT[] := ARRAY['太郎', '花子', '一郎', '美咲', '健太', 'さくら', '大輔', '愛', '翔太', '美穂'];
    prefectures TEXT[] := ARRAY['東京都', '大阪府', '神奈川県', '愛知県', '埼玉県', '千葉県', '兵庫県', '北海道', '福岡県', '静岡県'];
    user_uuid UUID;
    email_addr TEXT;
    full_name TEXT;
    prefecture TEXT;
    birth_date DATE;
    postcode_val TEXT;
    xp_amount INTEGER;
    level_val INTEGER;
    i INTEGER;
BEGIN
    FOR i IN 1..99 LOOP
        user_uuid := gen_random_uuid();
        
        full_name := surnames[1 + (random() * 9)::INTEGER] || given_names[1 + (random() * 9)::INTEGER];
        
        email_addr := 'user' || i || '@example.com';
        
        prefecture := prefectures[1 + (random() * 9)::INTEGER];
        
        birth_date := '1980-01-01'::DATE + (random() * 7300)::INTEGER;
        
        postcode_val := (1000000 + (random() * 8999999)::INTEGER)::TEXT;
        
        xp_amount := (random() * 3000)::INTEGER;
        level_val := CASE 
            WHEN xp_amount >= 2000 THEN 10 + (random() * 8)::INTEGER
            WHEN xp_amount >= 1000 THEN 5 + (random() * 10)::INTEGER
            WHEN xp_amount >= 300 THEN 3 + (random() * 7)::INTEGER
            ELSE 1 + (random() * 3)::INTEGER
        END;
        
        -- auth.usersテーブルに挿入
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (user_uuid, email_addr, crypt('password123', gen_salt('bf')), now(), now(), now());
        
        -- private_usersテーブルに挿入
        INSERT INTO private_users (id, name, address_prefecture, date_of_birth, x_username, postcode)
        VALUES (user_uuid, full_name, prefecture, birth_date, NULL, postcode_val);
        
        INSERT INTO user_levels (user_id, xp, level, updated_at)
        VALUES (user_uuid, xp_amount, level_val, now() - (random() * interval '30 days'));
    END LOOP;
END $$;

-- ユーザー（安野たかひろのみ手動定義、残りは上記のループで生成）
INSERT INTO private_users (id, name, address_prefecture, date_of_birth, x_username, postcode)
VALUES
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '安野たかひろ', '東京都', '1990-12-01', 'takahiroanno', '1000001');

-- ユーザーレベル情報（安野たかひろのみ手動定義、残りは上記のループで生成）
INSERT INTO user_levels (user_id, xp, level, updated_at)
VALUES
  -- 1位: 安野たかひろ（レベル20、最高XP）
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 3325, 20, '2025-06-04T10:00:00Z');

-- ミッション
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count)
VALUES
  ('e2898d7e-903f-4f9a-8b1b-93f783c9afac', 'ゴミ拾いをしよう (成果物不要)', NULL, '近所のゴミを拾ってみよう！清掃活動の報告は任意です。', 1, NULL, 'NONE', NULL),
  ('2246205f-933f-4a86-83af-dbf6bb6cde90', '活動ブログを書こう (リンク提出)', '/img/mission_fallback_icon.png', 'あなたの活動についてブログ記事を書き、URLを提出してください。', 2, NULL, 'LINK', 10),
  ('3346205f-933f-4a86-83af-dbf6bb6cde91', '今日のベストショット (画像提出)', '/img/mission_fallback_icon.png', '今日の活動で見つけた素晴らしい瞬間を写真で共有してください。', 3, '2025-06-01', 'IMAGE', NULL),
  ('4446205f-933f-4a86-83af-dbf6bb6cde92', '発見！地域の宝 (位置情報付き画像)', '/img/mission_fallback_icon.png', 'あなたの地域で見つけた素敵な場所や物を、位置情報付きの写真で教えてください。', 4, NULL, 'IMAGE_WITH_GEOLOCATION', 5),
  ('5546205f-933f-4a86-83af-dbf6bb6cde93', '日付付きミッション１ (成果物不要, 上限1回)', '/img/mission_fallback_icon.png', 'テスト用のミッションです。<a href="/">link test</a>', 5, '2025-05-01', 'NONE', 1),
  ('e5348472-d054-4ef4-81af-772c6323b669', 'Xのニックネームを入力しよう(テキスト提出)', NULL, 'Xのニックネームを入力しよう', 1, NULL, 'TEXT', NULL);  

-- ミッション達成（安野たかひろのみ）
INSERT INTO achievements (id, mission_id, user_id)
VALUES
  -- 安野たかひろの達成（トップユーザーらしく多数達成）
  ('17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19'),
  ('27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '2246205f-933f-4a86-83af-dbf6bb6cde90', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19'),
  ('37ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', '3346205f-933f-4a86-83af-dbf6bb6cde91', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19');

-- XPトランザクション履歴（安野たかひろのみ）
INSERT INTO xp_transactions (id, user_id, xp_amount, source_type, source_id, description, created_at)
VALUES
  -- 安野たかひろのXP履歴（合計3325 XP）
  ('11ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 50, 'MISSION_COMPLETION', '17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'ミッション「ゴミ拾いをしよう」達成', '2025-06-01T10:00:00Z'),
  ('22ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 100, 'MISSION_COMPLETION', '27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', 'ミッション「活動ブログを書こう」達成', '2025-06-02T14:30:00Z'),
  ('33ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 200, 'MISSION_COMPLETION', '37ea2e6e-9ccf-4d2d-a3b4-f34d1a612441', 'ミッション「今日のベストショット」達成', '2025-06-03T16:45:00Z'),
  ('44ea2e6e-9ccf-4d2d-a3b4-f34d1a612442', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 2975, 'BONUS', NULL, '初期ボーナスXP', '2025-05-15T09:00:00Z');
  
-- ミッション成果物のサンプルデータ
INSERT INTO mission_artifacts (achievement_id, user_id, artifact_type, link_url, description) 
VALUES 
  ('27ea2e6e-9ccf-4d2d-a3b4-f34d1a612440', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', 'LINK', 'https://example.com/anno-blog', '政治活動についての考察記事');

-- イベント
INSERT INTO events (id, title, url, starts_at)
VALUES
  ('d8314e09-6647-44ca-93c1-08c51707982b', '地域清掃イベント', 'https://example.com/event1', '2025-05-01T10:00:00Z');

-- 日次アクション数
INSERT INTO daily_action_summary (date, count) VALUES
  ('2025-05-01', 10);

-- 日次ダッシュボード登録人数
INSERT INTO daily_dashboard_registration_summary (date, count) VALUES
  ('2025-05-01', 100);

-- 都道府県別登録人数
INSERT INTO daily_dashboard_registration_by_prefecture_summary (date, prefecture, count) VALUES
  ('2025-05-01', '東京都', 15),
  ('2025-05-01', '大阪府', 12),
  ('2025-05-01', '神奈川県', 10),
  ('2025-05-01', '愛知県', 9),
  ('2025-05-01', '埼玉県', 8),
  ('2025-05-01', '千葉県', 8),
  ('2025-05-01', '兵庫県', 7),
  ('2025-05-01', '北海道', 10),
  ('2025-05-01', '福岡県', 9),
  ('2025-05-01', '静岡県', 12);
