"use client";

import { ARTIFACT_TYPES, getArtifactConfig } from "@/lib/artifactTypes";
import type { Tables } from "@/utils/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { GeolocationInput } from "./GeolocationInput";
import { ImageUploader } from "./ImageUploader";

type ArtifactFormProps = {
  mission: Tables<"missions">;
  authUser: User | null;
  disabled: boolean;
  submittedArtifactImagePath: string | null;
};

type GeolocationData = {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
};

export function ArtifactForm({
  mission,
  authUser,
  disabled,
  submittedArtifactImagePath,
}: ArtifactFormProps) {
  const [artifactImagePath, setArtifactImagePath] = useState<
    string | undefined
  >(undefined);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);

  const artifactConfig = mission
    ? getArtifactConfig(mission.required_artifact_type)
    : undefined;

  if (!artifactConfig || artifactConfig.key === ARTIFACT_TYPES.NONE.key) {
    return null;
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">
        成果物の提出 ({artifactConfig.displayName})
      </h2>
      <p className="text-sm text-gray-600 mb-2">{artifactConfig.prompt}</p>

      {/* リンク入力フォーム */}
      {artifactConfig.key === ARTIFACT_TYPES.LINK.key && (
        <div>
          <label
            htmlFor="artifactLink"
            className="block text-sm font-medium text-gray-700"
          >
            提出リンク
          </label>
          <input
            type="url"
            name="artifactLink"
            id="artifactLink"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://example.com"
            disabled={disabled}
            required
          />
        </div>
      )}

      {/* 画像アップロードフォーム */}
      {(artifactConfig.key === ARTIFACT_TYPES.IMAGE.key ||
        artifactConfig.key === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key) && (
        <div>
          <ImageUploader
            mission={mission}
            authUser={authUser}
            disabled={disabled}
            onImagePathChange={setArtifactImagePath}
            allowedMimeTypes={
              artifactConfig.allowedMimeTypes
                ? [...artifactConfig.allowedMimeTypes]
                : undefined
            }
            maxFileSizeMB={artifactConfig.maxFileSizeMB}
          />
          <input
            type="hidden"
            name="artifactImagePath"
            value={artifactImagePath || ""}
          />

          {/* 提出済みタスク時のプレビュー表示 */}
          {submittedArtifactImagePath && (
            <div className="mt-2">
              <p className="text-xs text-gray-700 mb-1">提出済み画像:</p>
              <img
                src={submittedArtifactImagePath}
                alt="提出済み画像"
                className="w-24 h-24 object-cover rounded border"
              />
            </div>
          )}

          {/* 位置情報入力 */}
          {artifactConfig.key === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key && (
            <>
              <GeolocationInput
                disabled={disabled}
                onGeolocationChange={setGeolocation}
              />
              {/* 位置情報用の隠しフィールド */}
              {geolocation && (
                <>
                  <input
                    type="hidden"
                    name="latitude"
                    value={geolocation.lat}
                  />
                  <input
                    type="hidden"
                    name="longitude"
                    value={geolocation.lon}
                  />
                  {geolocation.accuracy && (
                    <input
                      type="hidden"
                      name="accuracy"
                      value={geolocation.accuracy}
                    />
                  )}
                  {geolocation.altitude && (
                    <input
                      type="hidden"
                      name="altitude"
                      value={geolocation.altitude}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* 補足説明テキストエリア */}
      <textarea
        name="artifactDescription"
        placeholder="成果物に関する補足説明 (任意)"
        className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        rows={3}
        disabled={disabled}
      />
    </div>
  );
}
