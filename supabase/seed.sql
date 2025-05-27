-- ユーザー
INSERT INTO private_users (id, name, address_prefecture, date_of_birth, x_username, postcode)
VALUES
  ('622d6984-2f8a-41df-9ac3-cd4dcceb8d19', '安野たかひろ', '東京都', '1990-12-01', 'takahiroanno', '1000001'),
  ('2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', '田中花子', '大阪府', '1995-05-05', NULL, '5300001');

-- ミッション
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count)
VALUES
  ('e2898d7e-903f-4f9a-8b1b-93f783c9afac', 'ゴミ拾いをしよう (成果物不要)', NULL, '近所のゴミを拾ってみよう！清掃活動の報告は任意です。', 1, NULL, 'NONE', NULL),
  ('2246205f-933f-4a86-83af-dbf6bb6cde90', '活動ブログを書こう (リンク提出)', '/img/mission_fallback_icon.png', 'あなたの活動についてブログ記事を書き、URLを提出してください。', 2, NULL, 'LINK', 10),
  ('3346205f-933f-4a86-83af-dbf6bb6cde91', '今日のベストショット (画像提出)', '/img/mission_fallback_icon.png', '今日の活動で見つけた素晴らしい瞬間を写真で共有してください。', 3, '2025-06-01', 'IMAGE', NULL),
  ('4446205f-933f-4a86-83af-dbf6bb6cde92', '発見！地域の宝 (位置情報付き画像)', '/img/mission_fallback_icon.png', 'あなたの地域で見つけた素敵な場所や物を、位置情報付きの写真で教えてください。', 4, NULL, 'IMAGE_WITH_GEOLOCATION', 5),
  ('5546205f-933f-4a86-83af-dbf6bb6cde93', '日付付きミッション１ (成果物不要, 上限1回)', '/img/mission_fallback_icon.png', 'テスト用のミッションです。<a href="/">link test</a>', 5, '2025-05-01', 'NONE', 1),
  ('05814416-9cd8-4582-a940-ced9a832efee', '動画を切り抜いてYoutubeショートにアップロードしよう', '/img/mission_fallback_icon.png', '動画を切り抜いてYoutubeショートにアップロードしてください。そのURLを教えてください。', 2, NULL, 'LINK', NULL),  
  ('41dedf9a-2290-4609-bb73-5469ee8dd909', 'いどばた政策サイトからマニフェストに提案しよう', '/img/mission_fallback_icon.png', '<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>サイトにアクセスし、マニフェストについて提案してみてください。提案できたURLを教えてください。', 3, NULL, 'LINK', NULL),
  ('56c03661-8243-42c6-bf81-9dba56c5abfe', 'マニフェストの感想をSNSでシェアしよう', '/img/mission_fallback_icon.png', '<a href="https://policy.team-mir.ai/view/README.md">いどばた政策</a>にアクセスし、マニフェストを読んだ感想をSNSでシェアしてください。シェアしたURLを教えてください。', 3, NULL, 'LINK', NULL),
  ('2c5f7173-48be-4989-9d1b-c749fd56ae44', '公式Xをフォローしよう', '/img/mission_fallback_icon.png', '<a href="https://x.com/team_mirai_jp">チームみらい</a>と、<a href="https://x.com/takahiroanno">安野たかひろ</a>の公式Xをフォローしてください。', 1, NULL, 'NONE', NULL),
  ('9071a1eb-e272-43be-9c6b-e08b258a41c3', '公式Youtubeチャンネルを登録しよう', '/img/mission_fallback_icon.png', '<a href="https://www.youtube.com/channel/UCiMwbmcCSMORJ-85XWhStBw">チームみらいの公式Youtubeチャンネル</a>をチャンネル登録してください。', 1, NULL, 'NONE', NULL),
  ('e7a03d8b-ef29-406f-b2fb-065285855997', '公式LINEアカウントを友達申請しよう', '/img/mission_fallback_icon.png', '<a href="https://line.me/R/ti/p/@465hhyop?oat_content=url&ts=05062204">チームみらいのLINEアカウント</a>に友達申請してください。', 1, NULL, 'NONE', NULL);

-- ミッション達成
INSERT INTO achievements (id, mission_id, user_id)
VALUES
  ('17ea2e6e-9ccf-4d2d-a3b4-f34d1a612439', 'e2898d7e-903f-4f9a-8b1b-93f783c9afac', '622d6984-2f8a-41df-9ac3-cd4dcceb8d19'),
  ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2246205f-933f-4a86-83af-dbf6bb6cde90', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f');

-- (オプション) mission_artifacts と mission_artifact_geolocations のサンプルデータ
-- これらはアプリケーションロジック経由で作成されるのが主だが、テスト用に直接挿入も可能
INSERT INTO mission_artifacts (achievement_id, user_id, artifact_type, link_url, description) VALUES ('953bcc49-56c4-4913-8ce4-f6d721e3c4ef', '2c23c05b-8e25-4d0d-9e68-d3be74e4ae8f', 'LINK', 'https://example.com/my-activity-blog', '活動報告ブログです');


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
