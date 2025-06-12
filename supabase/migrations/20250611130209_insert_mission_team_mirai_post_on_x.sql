-- Xでチームみらいに関する投稿をしよう ミッションを追加
INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES (
  '8f923e4a-bc5d-4a7e-9e1f-2c8d7b6a4e9f',
  'Xでチームみらいに関する投稿をしよう',
  '/img/mission_fallback.svg',
  'チームみらいの活動や政策について、あなたの声をXで発信してみよう！<a href="https://policy.team-mir.ai/view/README.md">いどばた政策サイト</a>で見つけた政策への感想を投稿したり、イベント参加の感想を共有したり...たとえば『共感した』だけでもうれしいです。政治をもっと身近に感じる第一歩を踏み出そう！',
  2,
  NULL,
  'LINK',
  NULL,
  'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//18_x_post.png',
  '投稿したポストのURL')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  icon_url = EXCLUDED.icon_url,
  content = EXCLUDED.content,
  difficulty = EXCLUDED.difficulty,
  event_date = EXCLUDED.event_date,
  required_artifact_type = EXCLUDED.required_artifact_type,
  max_achievement_count = EXCLUDED.max_achievement_count,
  ogp_image_url = EXCLUDED.ogp_image_url,
  artifact_label = EXCLUDED.artifact_label;
