"use client";

import { ArtifactForm } from "@/components/mission/ArtifactForm";
import { SubmitButton } from "@/components/submit-button";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import type { Tables } from "@/lib/utils/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useMissionSubmission } from "../_hooks/useMissionSubmission";
import type { Achievement } from "../_lib/types";
import { achieveMissionAction } from "../actions";

type Props = {
  mission: Tables<"missions">;
  authUser: User | null;
  userAchievementCount: number;
  userAchievements: Achievement[];
};

export function MissionFormWrapper({
  mission,
  authUser,
  userAchievementCount,
  userAchievements,
}: Props) {
  const { buttonLabel, isButtonDisabled, hasReachedUserMaxAchievements } =
    useMissionSubmission(mission, authUser, userAchievementCount);

  return (
    <form action={achieveMissionAction} className="flex flex-col gap-4">
      <input type="hidden" name="missionId" value={mission.id} />
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
      />

      {hasReachedUserMaxAchievements &&
        mission?.max_achievement_count !== null && (
          <p className="text-sm font-semibold text-center">
            あなたはこのミッションの達成回数の上限 (
            {mission.max_achievement_count}回) に達しました。
          </p>
        )}

      {!hasReachedUserMaxAchievements &&
        userAchievementCount > 0 &&
        mission?.max_achievement_count !== null && (
          <p className="text-sm font-semibold text-center">
            あなたの達成回数: {userAchievementCount} /{" "}
            {mission.max_achievement_count}回
          </p>
        )}

      <SubmitButton pendingText="登録中..." disabled={isButtonDisabled}>
        {buttonLabel}
      </SubmitButton>
    </form>
  );
}
