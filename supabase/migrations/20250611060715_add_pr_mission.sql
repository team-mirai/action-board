INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  (
    gen_random_uuid(),
    '開発者向け: Githubでプルリクエストを出そう',
    '/img/mission_fallback.svg',
    '<a href="https://policy.team-mir.ai/view/README.md" target="_blank" rel="noopener noreferrer">チームみらいのマニフェスト</a>を読んで、プルリクエストであなたの意見を提案しよう！チームみらいではマニフェストを皆さんと共に議論し、どんどんアップデート（改善）をしてゆきます。',
    2,
    NULL,
    'LINK',
    NULL,
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//14_github_pull_request.png',
    'あなたが作成したプルリクエストのURL'
  )