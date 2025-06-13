-- ポスティングミッションの説明文を更新（Notionページへのリンクを追加）

UPDATE missions 
SET 
    content = 'チームみらいの機関誌を地域に配布してください。ポスティングした枚数と場所を報告してください。配布1枚につき5ポイントを獲得できます。

詳しいポスティングの方法や注意点については、こちらのページをご確認ください：
<a target="_blank" href="https://team-mirai.notion.site/206f6f56bae18049a2c2f989bc183a53">機関誌ポスティング</a>

活動前に必ずガイドラインをお読みいただき、適切な方法でポスティングを行ってください。',
    ogp_image_url = 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//15_posting.png'
WHERE title = 'チームみらいの機関誌をポスティングしよう'
  AND required_artifact_type = 'POSTING';
