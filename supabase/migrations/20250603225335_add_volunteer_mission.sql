INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  (
    gen_random_uuid(),
    'ボランティアに登録しよう',
    '/img/mission_fallback.svg',
    '私たち「チームみらい」はまさに今、「あなた」のお力を必要としています。ぜひボランティア登録をして一緒に、未来をより良いものへと変えていきましょう！<br/><a href="https://docs.google.com/forms/d/e/1FAIpQLScBqdkRNCRjy5OfLMM-drRWMCZDLrqx5YQVemhLsiH93KNq8g/viewform" target="_blank" rel="noopener noreferrer">ボランティア登録はこちらから</a>',
    1,
    NULL,
    'TEXT',
    1,
    '',
    '登録したメールアドレス'
  )