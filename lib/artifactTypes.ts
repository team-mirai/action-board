export const ARTIFACT_TYPES = {
  LINK: {
    key: "LINK",
    displayName: "リンク",
    prompt: "提出する成果物のURLを入力してください。",
    validationRegex: /^https?:\/\/.+/, // 簡単なURL形式のバリデーション例
  },
  IMAGE: {
    key: "IMAGE",
    displayName: "画像",
    prompt: "成果物として画像をアップロードしてください。",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileSizeMB: 10, // スキーマで設定した10MBと合わせる
  },
  IMAGE_WITH_GEOLOCATION: {
    // 追加
    key: "IMAGE_WITH_GEOLOCATION",
    displayName: "画像 (位置情報付き)",
    prompt: "位置情報付きで成果物画像をアップロードしてください。",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxFileSizeMB: 10,
  },
  NONE: {
    key: "NONE",
    displayName: "成果物不要",
    prompt: "このミッションでは成果物の提出は不要です。",
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
