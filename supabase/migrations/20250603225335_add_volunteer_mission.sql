INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_lavel)
VALUES
  (
    gen_random_uuid(),
    'ボランティアに登録しよう',
    '/img/mission_fallback_icon.png',
    '<a href="https://docs.google.com/forms/d/e/1FAIpQLScBqdkRNCRjy5OfLMM-drRWMCZDLrqx5YQVemhLsiH93KNq8g/viewform" target="_blank" rel="noopener noreferrer">ボランティア登録フォーム</a>からボランティアに登録してください。<br/>成果物として、登録したメールアドレスを入力してください。<br/>',
    1,
    NULL,
    'TEXT',
    1,
    "",
    "登録したメールアドレス"
  )