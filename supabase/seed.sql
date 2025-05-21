
-- ユーザー
INSERT INTO private_users (id, name, address_prefecture, x_username, postcode)
VALUES
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '山田太郎', '東京都', 'yamada_x', '1000001'),
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '田中花子', '大阪府', NULL, '5300001');

-- ミッション
INSERT INTO missions (id, title, icon_url, content)
VALUES
  ('e2898d7e-903f-4f9a-8b1b-93f783c9afac', 'ゴミ拾いをしよう', NULL, '近所のゴミを拾ってみよう！'),
  ('2246205f-933f-4a86-83af-dbf6bb6cde90', 'SNSに発信しよう', 'https://example.com/icon2.png', '活動の様子をSNSに投稿してみよう。');

-- ミッション達成
INSERT INTO achievements (id, mission_id, user_id, evidence)
VALUES
  ('17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '{"photo_url": "https://example.com/photo1.jpg"}'),
  ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2246205f-933f-4a86-83af-dbf6bb6cde90', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '{"tweet_url": "https://twitter.com/example/status/123"}');

-- イベント
INSERT INTO events (id, title, url, starts_at)
VALUES
  ('d8314e09-6647-44ca-93c1-08c51707982b', '地域清掃イベント', 'https://example.com/event1', '2025-05-01T10:00:00Z');

-- 日次アクション数
INSERT INTO daily_action_summary (date, count) VALUES
  ('2025-05-01', 10);

-- 日次ダッシュボード登録人数
INSERT INTO daily_dashboard_registration_summary (date, count) VALUES
  ('2025-05-01', 5);

-- 都道府県別登録人数
INSERT INTO daily_dashboard_registration_by_prefecture_summary (date, prefecture, count) VALUES
  ('2025-05-01', '東京都', 3),
  ('2025-05-01', '大阪府', 2);
