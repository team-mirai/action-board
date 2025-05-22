"use client";

import { achieveMissionAction } from "@/app/actions";
import { ArtifactForm } from "@/components/mission/ArtifactForm";
import { MissionDetails } from "@/components/mission/MissionDetails";
import SubmissionHistoryComponent from "@/components/submission-history";
import { SubmitButton } from "@/components/submit-button";
import { ARTIFACT_TYPES, getArtifactConfig } from "@/lib/artifactTypes";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import type { Tables } from "@/utils/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Props = {
  params: { id: string };
};

type Achievement = {
  created_at: string;
  id: string;
  mission_id: string | null;
  user_id: string | null;
};

type MissionArtifact = Tables<"mission_artifacts"> & {
  geolocations?: Tables<"mission_artifact_geolocations">[];
};

// ローカルで使用する提出履歴の型定義
type SubmissionData = {
  id: string; // achievement_id
  mission_id: string | null;
  user_id: string | null;
  artifacts: MissionArtifact[];
  created_at: string;
};

type ButtonLabelProps = {
  authUser: User | null;
  achievement: Achievement | null;
  userAchievementCount: number;
  maxAchievementCount: number | null;
};

function buttonLabel({
  authUser,
  userAchievementCount,
  maxAchievementCount,
}: ButtonLabelProps) {
  if (authUser === null) {
    return "ログインしてください";
  }

  // 最大達成回数が設定されていて、ユーザーの達成回数が最大に達している場合
  if (
    maxAchievementCount !== null &&
    userAchievementCount >= maxAchievementCount
  ) {
    return "このミッションは完了済みです";
  }

  // 達成回数が1回以上の場合は、再度提出可能であることを示す
  if (userAchievementCount > 0) {
    return "再度提出する";
  }

  return "完了する";
}

export default function MissionPage({ params }: Props) {
  const { id: missionId } = params;
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [mission, setMission] = useState<Tables<"missions"> | null>(null);
  const [currentUserAchievement, setCurrentUserAchievement] =
    useState<Achievement | null>(null);
  const [userAchievementCount, setUserAchievementCount] = useState<number>(0);
  const [totalAchievementCount, setTotalAchievementCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);

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
          .select("*, required_artifact_type, max_achievement_count")
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
        // 現在のユーザーの達成情報を取得（最新の1件）
        const { data: achievementData, error: achievementError } =
          await supabaseBrowserClient
            .from("achievements")
            .select("id, created_at, mission_id, user_id")
            .eq("user_id", user.id)
            .eq("mission_id", missionData.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
        if (achievementError && achievementError.code !== "PGRST116") {
          console.error(
            "Current user achievement fetch error:",
            achievementError,
          );
        }
        setCurrentUserAchievement(achievementData);

        // ユーザーの達成回数を取得
        const { data: userCountData, error: userCountError } =
          await supabaseBrowserClient
            .from("achievements")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .eq("mission_id", missionData.id);

        if (userCountError) {
          console.error("User achievement count fetch error:", userCountError);
        } else {
          setUserAchievementCount(userCountData.length);
        }

        // ユーザーの提出履歴を取得
        const { data: achievementsData, error: achievementsError } =
          await supabaseBrowserClient
            .from("achievements")
            .select("id, created_at, mission_id, user_id")
            .eq("user_id", user.id)
            .eq("mission_id", missionData.id)
            .order("created_at", { ascending: false });

        if (achievementsError) {
          console.error("Achievements fetch error:", achievementsError);
        } else if (achievementsData && achievementsData.length > 0) {
          // 各達成に対応する成果物を取得
          const submissionsWithArtifacts = await Promise.all(
            achievementsData.map(async (achievement) => {
              const { data: artifactsData, error: artifactsError } =
                await supabaseBrowserClient
                  .from("mission_artifacts")
                  .select("*")
                  .eq("achievement_id", achievement.id);

              if (artifactsError) {
                console.error("Artifacts fetch error:", artifactsError);
                return {
                  ...achievement,
                  artifacts: [],
                };
              }

              // 成果物に画像がある場合は署名付きURLを取得
              const artifactsWithSignedUrls = await Promise.all(
                artifactsData.map(async (artifact) => {
                  if (artifact.image_storage_path) {
                    const { data: signedUrlData } =
                      await supabaseBrowserClient.storage
                        .from("mission_artifact_files")
                        .createSignedUrl(artifact.image_storage_path, 60);

                    if (signedUrlData) {
                      return {
                        ...artifact,
                        image_storage_path: signedUrlData.signedUrl,
                      };
                    }
                  }
                  return artifact;
                }),
              );

              // 位置情報を取得
              const artifactsWithGeolocations = await Promise.all(
                artifactsWithSignedUrls.map(async (artifact) => {
                  if (artifact.artifact_type === "IMAGE_WITH_GEOLOCATION") {
                    const { data: geolocationsData, error: geolocationsError } =
                      await supabaseBrowserClient
                        .from("mission_artifact_geolocations")
                        .select("*")
                        .eq("mission_artifact_id", artifact.id);

                    if (!geolocationsError && geolocationsData) {
                      return {
                        ...artifact,
                        geolocations: geolocationsData,
                      };
                    }
                  }
                  return artifact;
                }),
              );

              return {
                ...achievement,
                artifacts: artifactsWithGeolocations,
              } as SubmissionData;
            }),
          );

          // null値をフィルタリングして型安全にする
          const validSubmissions = submissionsWithArtifacts.filter(
            (submission): submission is SubmissionData =>
              submission.mission_id !== null && submission.user_id !== null,
          );

          setSubmissions(validSubmissions);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [missionId, supabaseBrowserClient]);

  // ミッション全体の最大達成回数に達したかどうか
  const hasReachedTotalMaxAchievements =
    mission?.max_achievement_count !== null &&
    typeof mission?.max_achievement_count === "number" &&
    totalAchievementCount >= mission.max_achievement_count;

  // ユーザー個人の最大達成回数に達したかどうか
  const hasReachedUserMaxAchievements =
    mission?.max_achievement_count !== null &&
    typeof mission?.max_achievement_count === "number" &&
    userAchievementCount >= mission.max_achievement_count;

  // ボタンを無効化する条件
  const isButtonDisabled = authUser === null || hasReachedUserMaxAchievements;

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (!mission) {
    return <div className="p-4">ミッションが見つかりません。</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <MissionDetails mission={mission} />

      <form action={achieveMissionAction} className="flex flex-col gap-4">
        <input type="hidden" name="missionId" value={mission.id} />
        <input type="hidden" name="userId" value={authUser?.id ?? ""} />
        <input
          type="hidden"
          name="requiredArtifactType"
          value={mission.required_artifact_type ?? ARTIFACT_TYPES.NONE.key}
        />

        <ArtifactForm
          mission={mission}
          authUser={authUser}
          disabled={isButtonDisabled}
          submittedArtifactImagePath={null}
          userAchievementCount={userAchievementCount}
        />

        {hasReachedUserMaxAchievements &&
          mission?.max_achievement_count !== null && (
            <p className="text-sm text-red-600 font-semibold text-center">
              あなたはこのミッションの達成回数の上限 (
              {mission.max_achievement_count}回) に達しました。
            </p>
          )}

        {!hasReachedUserMaxAchievements &&
          userAchievementCount > 0 &&
          mission?.max_achievement_count !== null && (
            <p className="text-sm text-blue-600 font-semibold text-center">
              あなたの達成回数: {userAchievementCount} /{" "}
              {mission.max_achievement_count}回
            </p>
          )}

        <SubmitButton
          pendingText="登録中..."
          disabled={isButtonDisabled}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {buttonLabel({
            authUser,
            achievement: currentUserAchievement,
            userAchievementCount,
            maxAchievementCount: mission?.max_achievement_count || null,
          })}
        </SubmitButton>
      </form>

      {/* 提出履歴 */}
      {/* 提出履歴 - 1つ以上の履歴がある場合に表示 */}
      {submissions.length > 0 && (
        <SubmissionHistoryComponent
          submissions={submissions.map((sub) => ({
            ...sub,
            mission_id: sub.mission_id || "",
            user_id: sub.user_id || "",
          }))}
          missionId={missionId}
          userId={authUser?.id}
          maxAchievementCount={mission.max_achievement_count || 0}
        />
      )}
    </div>
  );
}
