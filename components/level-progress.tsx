import type { UserLevel } from "@/lib/services/userLevel";
import { totalXp } from "@/lib/utils/utils";
import React from "react";
import { ProgressBarSimple } from "./ui/progress-bar-simple";
import { ProgressCircle } from "./ui/progress-circle";

interface LevelProgressProps {
  userLevel: UserLevel | null;
}

export function LevelProgress({ userLevel }: LevelProgressProps) {
  const currentLevel = userLevel?.level ?? 1;
  const currentXp = userLevel?.xp ?? 0;

  // 現在のレベルの開始XP（累計）
  const currentLevelStartXp = totalXp(currentLevel);

  // 次のレベルに必要なXP（累計）
  const nextLevelRequiredXp = totalXp(currentLevel + 1);

  // 現在のレベル内での進捗XP
  const progressInCurrentLevel = currentXp - currentLevelStartXp;

  // 現在のレベルで必要なXP範囲
  const xpRangeForCurrentLevel = nextLevelRequiredXp - currentLevelStartXp;

  return (
    <ProgressBarSimple
      current={progressInCurrentLevel}
      max={xpRangeForCurrentLevel}
    />
  );
}
