"use client";

import { markLevelUpSeenAction } from "@/app/actions/level-up";
import type { UserLevel } from "@/lib/services/userLevel";
import { calculateLevel, totalXp } from "@/lib/utils/utils";
import { useCallback, useState } from "react";

interface UseXpProgressAnimationProps {
  onLevelUp?: (newLevel: number, pointsToNextLevel: number) => void;
}

interface AnimationStage {
  level: number;
  startXp: number;
  endXp: number;
  levelStartXp: number;
  nextLevelRequiredXp: number;
  xpRangeForLevel: number;
}

enum AnimationState {
  IDLE = "idle", // 何も表示していない
  TOAST_SHOWING = "toast", // トーストを表示中
  DIALOG_SHOWING = "dialog", // ダイアログを表示中
}

export function useXpProgressAnimation({
  onLevelUp,
}: UseXpProgressAnimationProps = {}) {
  const [animationState, setAnimationState] = useState<AnimationState>(
    AnimationState.IDLE,
  );
  const [toastData, setToastData] = useState<{
    userLevel: UserLevel;
    xpGranted: number;
    startLevel: number;
    startLevelStartXp: number;
    nextLevelRequiredXp: number;
    xpRangeForCurrentLevel: number;
    isMultiLevel?: boolean;
    stages?: AnimationStage[];
    finalLevel?: number;
  } | null>(null);
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    pointsToNextLevel: number;
  } | null>(null);

  const [willLevelUp, setWillLevelUp] = useState(false);

  const showLevelUpDialog = useCallback(
    async (newLevel: number, pointsToNextLevel: number) => {
      setLevelUpData({ newLevel, pointsToNextLevel });
      setAnimationState(AnimationState.DIALOG_SHOWING);
      onLevelUp?.(newLevel, pointsToNextLevel);

      try {
        const result = await markLevelUpSeenAction();
        if (!result.success) {
          console.error(
            "Failed to mark level up notification as seen:",
            result.error,
          );
        }
      } catch (error) {
        console.error("Error marking level up notification as seen:", error);
      }
    },
    [onLevelUp],
  );

  const handleAnimationComplete = useCallback(() => {
    if (willLevelUp && toastData) {
      setTimeout(() => {
        setAnimationState(AnimationState.IDLE);

        setTimeout(() => {
          const endXp = toastData.userLevel.xp;
          const finalLevel = calculateLevel(endXp);
          const finalLevelStartXp = totalXp(finalLevel);
          const finalNextLevelRequiredXp = totalXp(finalLevel + 1);
          const pointsToNextLevel = finalNextLevelRequiredXp - endXp;

          showLevelUpDialog(finalLevel, pointsToNextLevel);
        }, 300); // 300ms待ってからダイアログを表示
      }, 1000); // トーストを1秒間表示してから閉じる
    } else {
      setTimeout(() => {
        setAnimationState(AnimationState.IDLE);
        setToastData(null);
      }, 1000);
    }
  }, [willLevelUp, toastData, showLevelUpDialog]);

  const checkLevelUp = useCallback(
    (
      currentXp: number,
      endXp: number,
      nextLevelRequiredXp: number,
      isMultiLevel?: boolean,
      finalLevel?: number,
    ) => {
      return false;
    },
    [],
  );

  const startXpAnimation = useCallback(
    (userLevel: UserLevel, xpGranted: number) => {
      const startXp = userLevel.xp - xpGranted;
      const endXp = userLevel.xp;
      const startLevel = calculateLevel(startXp);
      const finalLevel = calculateLevel(endXp);

      const levelUpWillOccur = finalLevel > startLevel;
      setWillLevelUp(levelUpWillOccur);

      if (finalLevel > startLevel + 1) {
        const stages: AnimationStage[] = [];
        for (let level = startLevel; level < finalLevel; level++) {
          const stageStartXp = Math.max(startXp, totalXp(level));
          const stageEndXp = Math.min(endXp, totalXp(level + 1));
          stages.push({
            level,
            startXp: stageStartXp,
            endXp: stageEndXp,
            levelStartXp: totalXp(level),
            nextLevelRequiredXp: totalXp(level + 1),
            xpRangeForLevel: totalXp(level + 1) - totalXp(level),
          });
        }

        setToastData({
          userLevel,
          xpGranted,
          startLevel,
          startLevelStartXp: totalXp(startLevel),
          nextLevelRequiredXp: totalXp(startLevel + 1),
          xpRangeForCurrentLevel: totalXp(startLevel + 1) - totalXp(startLevel),
          isMultiLevel: true,
          stages,
          finalLevel,
        });

        import("@/components/xp-progress-toast-sonner").then(
          ({ showXpProgressToast }) => {
            showXpProgressToast({
              userLevel,
              xpGranted,
              startLevel,
              startLevelStartXp: totalXp(startLevel),
              nextLevelRequiredXp: totalXp(startLevel + 1),
              xpRangeForCurrentLevel:
                totalXp(startLevel + 1) - totalXp(startLevel),
              isMultiLevel: true,
              stages,
              finalLevel,
              onLevelUp: checkLevelUp,
              onAnimationComplete: handleAnimationComplete,
            });
          },
        );
      } else {
        const startLevelStartXp = totalXp(startLevel);
        const nextLevelRequiredXp = totalXp(startLevel + 1);
        const xpRangeForCurrentLevel = nextLevelRequiredXp - startLevelStartXp;

        setToastData({
          userLevel,
          xpGranted,
          startLevel,
          startLevelStartXp,
          nextLevelRequiredXp,
          xpRangeForCurrentLevel,
          isMultiLevel: false,
        });

        import("@/components/xp-progress-toast-sonner").then(
          ({ showXpProgressToast }) => {
            showXpProgressToast({
              userLevel,
              xpGranted,
              startLevel,
              startLevelStartXp,
              nextLevelRequiredXp,
              xpRangeForCurrentLevel,
              isMultiLevel: false,
              onLevelUp: checkLevelUp,
              onAnimationComplete: handleAnimationComplete,
            });
          },
        );
      }
      setAnimationState(AnimationState.TOAST_SHOWING);
    },
    [checkLevelUp, handleAnimationComplete],
  );

  const handleLevelUp = useCallback(
    async (newLevel: number, pointsToNextLevel: number) => {
      setLevelUpData({ newLevel, pointsToNextLevel });
      setIsLevelUpDialogOpen(true);
      onLevelUp?.(newLevel, pointsToNextLevel);

      try {
        const result = await markLevelUpSeenAction();
        if (!result.success) {
          console.error(
            "Failed to mark level up notification as seen:",
            result.error,
          );
        }
      } catch (error) {
        console.error("Error marking level up notification as seen:", error);
      }
    },
    [onLevelUp],
  );

  const handleLevelUpDialogClose = useCallback(async () => {
    setAnimationState(AnimationState.IDLE);
    setLevelUpData(null);
    setWillLevelUp(false);

    try {
      const result = await markLevelUpSeenAction();
      if (!result.success) {
        console.error(
          "Failed to mark level up notification as seen:",
          result.error,
        );
      }
    } catch (error) {
      console.error("Error marking level up notification as seen:", error);
    }
  }, []);

  const handleToastClose = useCallback(() => {
    if (animationState === AnimationState.TOAST_SHOWING) {
      setAnimationState(AnimationState.IDLE);
      setToastData(null);
      setWillLevelUp(false);
    }
  }, [animationState]);

  return {
    isToastOpen: animationState === AnimationState.TOAST_SHOWING,
    toastData,
    isLevelUpDialogOpen: animationState === AnimationState.DIALOG_SHOWING,
    levelUpData,
    startXpAnimation,
    handleLevelUp: showLevelUpDialog, // 後方互換性のため
    checkLevelUp,
    handleLevelUpDialogClose,
    handleAnimationComplete,
    handleToastClose,
  };
}
