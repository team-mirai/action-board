UPDATE missions
SET icon_url = '/img/mission_fallback.svg'
WHERE icon_url = '/img/mission_fallback_icon.png'
  OR icon_url IS NULL;
