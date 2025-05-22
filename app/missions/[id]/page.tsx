"use client"; // 追加

import { achieveMissionAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { ARTIFACT_TYPES, getArtifactConfig } from "@/lib/artifactTypes"; // パス変更
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { createClient as createServerClient } from "@/utils/supabase/server";
import type { Tables } from "@/utils/types/supabase"; // Tables型をインポート
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
// import ArtifactForm from "@/components/artifact-form"; // 後で作成

type Props = {
  params: { id: string };
};

type Achievement = {
  created_at: string;
  id: string;
  mission_id: string | null;
  user_id: string | null;
};

type buttonLabelProps = {
  authUser: User | null;
  achievement: Achievement | null;
};

function buttonLabel({ authUser, achievement }: buttonLabelProps) {
  if (authUser === null) {
    return "ログインしてください";
  }

  if (achievement !== null) {
    return "このミッションは完了済みです";
  }

  return "完了する";
}

export default function MissionPage({ params }: Props) {
  // asyncを削除
  const { id: missionId } = params;
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [mission, setMission] = useState<Tables<"missions"> | null>(null);
  const [currentUserAchievement, setCurrentUserAchievement] =
    useState<Achievement | null>(null); // ユーザー自身の達成状況
  const [totalAchievementCount, setTotalAchievementCount] = useState<number>(0); // ミッション全体の達成回数
  const [loading, setLoading] = useState(true);
  const [artifactImagePath, setArtifactImagePath] = useState<
    string | undefined
  >(undefined);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<{
    lat: number;
    lon: number;
    accuracy?: number;
    altitude?: number;
  } | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [isFetchingGeo, setIsFetchingGeo] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [submittedArtifactImagePath, setSubmittedArtifactImagePath] = useState<
    string | null
  >(null);

  const supabaseBrowserClient = createBrowserClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabaseBrowserClient.auth.getUser();
      setAuthUser(user);

      const { data: missionData, error: missionError } =
        await supabaseBrowserClient
          .from("missions")
          .select("*, required_artifact_type, max_achievement_count") // max_achievement_count を取得
          .eq("id", missionId)
          .single();

      if (missionError) {
        console.error("Mission fetch error:", missionError);
        setMission(null);
      } else if (missionData) {
        setMission(missionData);

        // ミッション全体の達成回数を取得
        const { data: countData, error: countError } =
          await supabaseBrowserClient
            .from("mission_achievement_count_view")
            .select("achievement_count")
            .eq("mission_id", missionData.id)
            .single();
        if (countError) {
          console.error("Count fetch error:", countError);
        } else if (countData) {
          setTotalAchievementCount(countData.achievement_count || 0);
        }
      }

      if (user?.id && missionData?.id) {
        const { data: achievementData, error: achievementError } =
          await supabaseBrowserClient
            .from("achievements")
            .select("id, created_at, mission_id, user_id")
            .eq("user_id", user.id) // ログインユーザーの達成状況
            .eq("mission_id", missionData.id)
            .single();
        if (achievementError && achievementError.code !== "PGRST116") {
          // PGRST116はレコードなしエラーなので無視
          console.error(
            "Current user achievement fetch error:",
            achievementError,
          );
        }
        setCurrentUserAchievement(achievementData);
        // ここでmission_artifactsも取得
        if (achievementData?.id) {
          const { data: artifactData, error: artifactError } =
            await supabaseBrowserClient
              .from("mission_artifacts")
              .select("image_storage_path")
              .eq("achievement_id", achievementData.id)
              .single();
          if (!artifactError && artifactData?.image_storage_path) {
            const signedUrl = await supabaseBrowserClient.storage
              .from("mission_artifact_files")
              .createSignedUrl(artifactData.image_storage_path, 60);
            if (signedUrl.data) {
              setSubmittedArtifactImagePath(signedUrl.data.signedUrl);
            } else {
              setSubmittedArtifactImagePath(null);
            }
          } else {
            setSubmittedArtifactImagePath(null);
          }
        } else {
          setSubmittedArtifactImagePath(null);
        }
      } else {
        setSubmittedArtifactImagePath(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [missionId, supabaseBrowserClient]);

  const artifactConfig = mission
    ? getArtifactConfig(mission.required_artifact_type)
    : undefined;

  const hasReachedMaxAchievements =
    mission?.max_achievement_count !== null &&
    typeof mission?.max_achievement_count === "number" && // 型ガードを追加
    totalAchievementCount >= mission.max_achievement_count;

  const isButtonDisabled =
    authUser === null ||
    currentUserAchievement !== null ||
    hasReachedMaxAchievements ||
    uploading ||
    isFetchingGeo; // 位置情報取得中も無効化

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
      .from("mission_artifact_files") // バケット名を変更
      .upload(fileName, file);

    setUploading(false);
    if (error) {
      console.error("Upload error:", error);
      setUploadError(`アップロードに失敗しました: ${error.message}`);
      setArtifactImagePath(undefined);
    } else {
      console.log("Uploaded data:", data);
      setArtifactImagePath(data.path);
      setUploadError(null);
    }
  };

  const handleGetGeolocation = () => {
    if (!navigator.geolocation) {
      setGeolocationError("お使いのブラウザは位置情報取得に対応していません。");
      return;
    }
    setIsFetchingGeo(true);
    setGeolocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude ?? undefined,
        });
        setIsFetchingGeo(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGeolocationError(`位置情報の取得に失敗しました: ${error.message}`);
        setGeolocation(null);
        setIsFetchingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (!mission) {
    return <div className="p-4">ミッションが見つかりません。</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">{mission.title}</h1>
      {mission.icon_url && (
        <img
          src={mission.icon_url}
          alt={mission.title}
          className="w-32 h-32 object-cover rounded-md"
        />
      )}
      <p className="text-gray-700 whitespace-pre-wrap">{mission.content}</p>
      <p className="text-sm text-gray-500">難易度: {mission.difficulty}</p>
      {mission.event_date && (
        <p className="text-sm text-gray-500">
          イベント日: {new Date(mission.event_date).toLocaleDateString()}
        </p>
      )}

      <form action={achieveMissionAction} className="flex flex-col gap-4">
        <input type="hidden" name="missionId" value={mission.id} />
        <input type="hidden" name="userId" value={authUser?.id ?? ""} />
        <input
          type="hidden"
          name="requiredArtifactType"
          value={mission.required_artifact_type ?? ARTIFACT_TYPES.NONE.key}
        />
        {/* 位置情報用の隠しフィールド */}
        {geolocation && (
          <>
            <input type="hidden" name="latitude" value={geolocation.lat} />
            <input type="hidden" name="longitude" value={geolocation.lon} />
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

        {/* 成果物入力フォーム (仮の表示) */}
        {artifactConfig && artifactConfig.key !== ARTIFACT_TYPES.NONE.key && (
          <div className="p-4 border rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">
              成果物の提出 ({artifactConfig.displayName})
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              {artifactConfig.prompt}
            </p>
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
                  disabled={isButtonDisabled}
                  required
                />
              </div>
            )}
            {(artifactConfig.key === ARTIFACT_TYPES.IMAGE.key ||
              artifactConfig.key ===
                ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key) && (
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
                  accept={artifactConfig?.allowedMimeTypes?.join(",")}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  disabled={isButtonDisabled || uploading}
                  onChange={handleImageUpload}
                  required
                />
                <input
                  type="hidden"
                  name="artifactImagePath"
                  value={artifactImagePath || ""}
                />
                {uploading && (
                  <p className="mt-1 text-xs text-blue-500">
                    アップロード中...
                  </p>
                )}
                {uploadError && (
                  <p className="mt-1 text-xs text-red-500">{uploadError}</p>
                )}
                {artifactImagePath && !uploadError && (
                  <p className="mt-1 text-xs text-green-500">
                    画像アップロード完了: {artifactImagePath.split("/").pop()}
                  </p>
                )}
                {/* プレビュー表示（アップロード時） */}
                {previewImageUrl && !currentUserAchievement && (
                  <img
                    src={previewImageUrl}
                    alt="プレビュー"
                    className="mt-2 w-24 h-24 object-cover rounded border"
                  />
                )}
                {/* 提出済みタスク時のプレビュー表示 */}
                {currentUserAchievement && submittedArtifactImagePath && (
                  <img
                    src={`${submittedArtifactImagePath}`}
                    alt="提出済み画像"
                    className="mt-2 w-24 h-24 object-cover rounded border"
                  />
                )}
                <p className="mt-1 text-xs text-gray-500">
                  最大ファイルサイズ: {artifactConfig?.maxFileSizeMB}MB
                </p>

                {artifactConfig.key ===
                  ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleGetGeolocation}
                      disabled={isButtonDisabled || isFetchingGeo}
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded disabled:opacity-50"
                    >
                      {isFetchingGeo
                        ? "位置情報取得中..."
                        : "位置情報を取得する"}
                    </button>
                    {geolocationError && (
                      <p className="mt-1 text-xs text-red-500">
                        {geolocationError}
                      </p>
                    )}
                    {geolocation && (
                      <p className="mt-1 text-xs text-green-500">
                        位置情報取得完了: Lat: {geolocation.lat.toFixed(4)},
                        Lon: {geolocation.lon.toFixed(4)}
                        {geolocation.accuracy &&
                          ` (精度: ${geolocation.accuracy.toFixed(1)}m)`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <textarea
              name="artifactDescription"
              placeholder="成果物に関する補足説明 (任意)"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={3}
              disabled={isButtonDisabled}
            />
          </div>
        )}
        {/* ArtifactForm コンポーネントを後でここに挿入 */}
        {/* <ArtifactForm mission={mission} userId={authUser?.id} disabled={isButtonDisabled} /> */}

        {hasReachedMaxAchievements &&
          mission?.max_achievement_count !== null && (
            <p className="text-sm text-red-600 font-semibold text-center">
              このミッションは達成回数の上限 ({mission.max_achievement_count}回)
              に達しました。
            </p>
          )}

        <SubmitButton
          pendingText="登録中..."
          disabled={isButtonDisabled}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {buttonLabel({ authUser, achievement: currentUserAchievement })}
        </SubmitButton>
      </form>
    </div>
  );
}
