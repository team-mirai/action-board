export const ARTIFACT_TYPES = {
  LINK: {
    key: "LINK",
    displayName: "リンク",
    prompt: "成果物のURLを入力してください。",
    validationRegex: /^https?:\/\/.+/,
  },
  IMAGE: {
    key: "IMAGE",
    displayName: "画像",
    prompt: "画像の添付が必要です。",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileSizeMB: 10,
  },
  IMAGE_WITH_GEOLOCATION: {
    key: "IMAGE_WITH_GEOLOCATION",
    displayName: "画像および位置情報",
    prompt: "画像の添付と位置情報の設定が必要です。",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileSizeMB: 10,
  },
  NONE: {
    key: "NONE",
    displayName: "添付データ不要",
    prompt: "このミッションでは添付データの投稿は不要です。",
  },
} as const;

export type ArtifactTypeKey = keyof typeof ARTIFACT_TYPES;

export type ArtifactConfig = (typeof ARTIFACT_TYPES)[ArtifactTypeKey];

export function getArtifactConfig(
  typeKey: ArtifactTypeKey | string | undefined | null,
): ArtifactConfig | undefined {
  if (!typeKey || !Object.keys(ARTIFACT_TYPES).includes(typeKey)) {
    // 不明なタイプやNONEの場合は、NONEの設定を返すか、undefinedを返す
    // ここではNONEをデフォルトとして扱う
    return ARTIFACT_TYPES.NONE;
  }
  return ARTIFACT_TYPES[typeKey as ArtifactTypeKey];
}

// ミッションの required_artifact_type に保存する値の型
export type MissionRequiredArtifactType =
  | ArtifactTypeKey
  | "LINK"
  | "IMAGE"
  | "IMAGE_WITH_GEOLOCATION"
  | "NONE";
