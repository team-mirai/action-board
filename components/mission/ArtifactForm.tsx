"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ARTIFACT_TYPES, getArtifactConfig } from "@/lib/artifactTypes";
import type { Tables } from "@/lib/utils/types/supabase";
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
    <Card>
      <CardHeader>
        <CardTitle>提出フォーム - {artifactConfig.displayName}</CardTitle>
        <p className="text-sm text-muted-foreground">{artifactConfig.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* リンク入力フォーム */}
        {artifactConfig.key === ARTIFACT_TYPES.LINK.key && (
          <div className="space-y-2">
            <Label htmlFor="artifactLink">提出リンク</Label>
            <Input
              type="url"
              name="artifactLink"
              id="artifactLink"
              placeholder="https://example.com"
              disabled={disabled}
              required
            />
          </div>
        )}

        {/* 画像アップロードフォーム */}
        {(artifactConfig.key === ARTIFACT_TYPES.IMAGE.key ||
          artifactConfig.key === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key) && (
          <div className="space-y-4">
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
            <Input
              type="hidden"
              name="artifactImagePath"
              value={artifactImagePath || ""}
            />

            {/* 提出済みタスク時のプレビュー表示 */}
            {submittedArtifactImagePath && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">提出済み画像:</p>
                <img
                  src={submittedArtifactImagePath}
                  alt="提出済み画像"
                  className="w-24 h-24 object-cover rounded border"
                />
              </div>
            )}

            {/* 位置情報入力 */}
            {artifactConfig.key ===
              ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key && (
              <>
                <GeolocationInput
                  disabled={disabled}
                  onGeolocationChange={setGeolocation}
                />
                {/* 位置情報用の隠しフィールド */}
                {geolocation && (
                  <>
                    <Input
                      type="hidden"
                      name="latitude"
                      value={geolocation.lat}
                    />
                    <Input
                      type="hidden"
                      name="longitude"
                      value={geolocation.lon}
                    />
                    {geolocation.accuracy ? (
                      <Input
                        type="hidden"
                        name="accuracy"
                        value={geolocation.accuracy}
                      />
                    ) : (
                      ""
                    )}
                    {geolocation.altitude ? (
                      <Input
                        type="hidden"
                        name="altitude"
                        value={geolocation.altitude}
                      />
                    ) : (
                      ""
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* 補足説明テキストエリア */}
        <div className="space-y-2">
          <Label htmlFor="artifactDescription">補足説明 (任意)</Label>
          <Textarea
            name="artifactDescription"
            id="artifactDescription"
            placeholder="提出内容に関する補足説明 (任意)"
            rows={3}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
