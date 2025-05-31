-- missionsテーブルにogp_image_urlカラムを追加
ALTER TABLE missions 
ADD COLUMN ogp_image_url VARCHAR(500);

COMMENT ON COLUMN missions.ogp_image_url IS 'OGP用の画像URL';
