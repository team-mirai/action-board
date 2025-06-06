import { totalXp } from "@/lib/services/userLevel";
import type { UserLevel } from "@/lib/services/userLevel";
import React from "react";
import { ProgressCircle } from "./ui/progress-circle";

interface LevelProgressProps {
  userLevel: UserLevel;
}

export function LevelProgress({ userLevel }: LevelProgressProps) {
  const currentLevel = userLevel.level;
  const currentXp = userLevel.xp;

  // 現在のレベルの開始XP（累計）
  const currentLevelStartXp = totalXp(currentLevel);

  // 次のレベルに必要なXP（累計）
  const nextLevelRequiredXp = totalXp(currentLevel + 1);

  // 現在のレベル内での進捗XP
  const progressInCurrentLevel = currentXp - currentLevelStartXp;

  // 現在のレベルで必要なXP範囲
  const xpRangeForCurrentLevel = nextLevelRequiredXp - currentLevelStartXp;

  return (
    <div className="flex flex-col items-center">
      <ProgressCircle
        current={progressInCurrentLevel}
        max={xpRangeForCurrentLevel}
        size={190}
        strokeWidth={15}
        animationDelay={200}
        centerText={
          <div className="text-center">
            <div className="text-xs font-bold mb-1">次のレベルまで</div>
            <div
              className="text-5xl font-bold leading-none"
              style={{ color: "#30BAA7" }}
            >
              {progressInCurrentLevel.toLocaleString()}
            </div>
            <div
              className="text-xs font-bold leading-none mt-1"
              style={{ color: "#30BAA7" }}
            >
              / {xpRangeForCurrentLevel.toLocaleString()}
            </div>
          </div>
        }
        centerTextClassName="px-4"
      />

      <div className="mt-4 text-center">
        <div className="flex items-center">
          <div className="text-sm">獲得ポイント：</div>
          <div>
            <span className="font-bold text-2xl">
              {currentXp.toLocaleString()}
            </span>
            <span className="font-bold">ポイント</span>
          </div>
        </div>
      </div>
    </div>
  );
}
