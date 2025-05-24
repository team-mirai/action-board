"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/utils/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

type ImageUploaderProps = {
  mission: Tables<"missions">;
  authUser: User | null;
  disabled: boolean;
  onImagePathChange: (path: string | undefined) => void;
  allowedMimeTypes?: readonly string[];
  maxFileSizeMB?: number;
};

export function ImageUploader({
  mission,
  authUser,
  disabled,
  onImagePathChange,
  allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSizeMB = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const supabaseBrowserClient = createClient();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (
      !event.target.files ||
      event.target.files.length === 0 ||
      !authUser?.id ||
      !mission?.id
    ) {
      setUploadError(
        "ファイルが選択されていないか、ユーザーまたはミッション情報がありません。",
      );
      return;
    }
    const file = event.target.files[0];
    // プレビュー用URL生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    const fileName = `${authUser.id}/${mission.id}/${Date.now()}_${file.name}`;
    setUploading(true);
    setUploadError(null);

    const { data, error } = await supabaseBrowserClient.storage
      .from("mission_artifact_files")
      .upload(fileName, file);

    setUploading(false);
    if (error) {
      console.error("Upload error:", error);
      setUploadError(`アップロードに失敗しました: ${error.message}`);
      onImagePathChange(undefined);
    } else {
      console.log("Uploaded data:", data);
      onImagePathChange(data.path);
      setUploadError(null);
    }
  };

  return (
    <div>
      <label
        htmlFor="artifactImage"
        className="block text-sm font-medium text-gray-700"
      >
        画像ファイル
      </label>
      <input
        type="file"
        id="artifactImage"
        accept={allowedMimeTypes?.join(",")}
        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        disabled={disabled || uploading}
        onChange={handleImageUpload}
        required
      />
      {uploading && (
        <p className="mt-1 text-xs text-blue-500">アップロード中...</p>
      )}
      {uploadError && (
        <p className="mt-1 text-xs text-red-500">{uploadError}</p>
      )}
      {/* プレビュー表示 */}
      {previewImageUrl && (
        <img
          src={previewImageUrl}
          alt="プレビュー"
          className="mt-2 w-24 h-24 object-cover rounded border"
        />
      )}
      <p className="mt-1 text-xs text-gray-500">
        最大ファイルサイズ: {maxFileSizeMB}MB
      </p>
    </div>
  );
}
