"use client";

import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { useMemo } from "react";

export function useMissionSubmission(
  mission: Tables<"missions">,
  authUser: User | null,
  userAchievementCount: number,
) {
  const buttonLabel = useMemo(() => {
    if (authUser === null) {
      return "ログインしてください";
    }

    if (
      mission.max_achievement_count !== null &&
      userAchievementCount >= mission.max_achievement_count
    ) {
      return "このミッションは完了済みです";
    }

    return "完了する";
  }, [authUser, mission.max_achievement_count, userAchievementCount]);

  const isButtonDisabled = useMemo(() => {
    return (
      authUser === null ||
      (mission.max_achievement_count !== null &&
        userAchievementCount >= mission.max_achievement_count)
    );
  }, [authUser, mission.max_achievement_count, userAchievementCount]);

  const hasReachedUserMaxAchievements = useMemo(() => {
    return (
      mission.max_achievement_count !== null &&
      userAchievementCount >= mission.max_achievement_count
    );
  }, [mission.max_achievement_count, userAchievementCount]);

  return {
    buttonLabel,
    isButtonDisabled,
    hasReachedUserMaxAchievements,
  };
}
