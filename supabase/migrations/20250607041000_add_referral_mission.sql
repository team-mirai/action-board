-- referralミッションの追加
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count)
VALUES
  ('f570446b-b1fd-f456-fc4b-935c2b493089', 'アクションボードを周りの人に紹介しよう', '/img/mission_fallback.svg', 'アクションボードを紹介しよう！登録してもらえたらミッション達成！', 3, NULL, 'REFERRAL', NULL); 