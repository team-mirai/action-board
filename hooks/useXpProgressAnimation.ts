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

// アニメーション状態を管理する列挙型
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

  // レベルアップが発生するかどうかを事前に判定
  const [willLevelUp, setWillLevelUp] = useState(false);

  const startXpAnimation = useCallback(
    (userLevel: UserLevel, xpGranted: number) => {
      const startXp = userLevel.xp - xpGranted;
      const endXp = userLevel.xp;
      const startLevel = calculateLevel(startXp);
      const finalLevel = calculateLevel(endXp);

      // レベルアップが発生するかを事前に判定
      const levelUpWillOccur = finalLevel > startLevel;
      setWillLevelUp(levelUpWillOccur);

      if (finalLevel > startLevel + 1) {
        // マルチレベルアップの場合
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
      } else {
        // 通常のレベルアップまたはレベルアップなしの場合
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
      }
      setAnimationState(AnimationState.TOAST_SHOWING);
    },
    [],
  );

  // レベルアップダイアログを遅延表示する関数
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

  // XPアニメーション完了時の処理
  const handleAnimationComplete = useCallback(() => {
    if (willLevelUp && toastData) {
      // レベルアップが発生する場合は、トーストを閉じてからダイアログを表示
      setTimeout(() => {
        setAnimationState(AnimationState.IDLE);

        // ダイアログ表示の準備
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
      // レベルアップがない場合は単純にトーストを閉じる
      setTimeout(() => {
        setAnimationState(AnimationState.IDLE);
        setToastData(null);
      }, 1000);
    }
  }, [willLevelUp, toastData, showLevelUpDialog]);

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

  // レベルアップ判定（アニメーション中は実際の処理を行わず、フラグのみ返す）
  const checkLevelUp = useCallback(
    (
      currentXp: number,
      endXp: number,
      nextLevelRequiredXp: number,
      isMultiLevel?: boolean,
      finalLevel?: number,
    ) => {
      // アニメーション中はレベルアップダイアログを表示せず、
      // アニメーション完了後に処理するためfalseを返す
      return false;
    },
    [],
  );

  const handleLevelUpDialogClose = useCallback(async () => {
    setAnimationState(AnimationState.IDLE);
    setLevelUpData(null);
    setWillLevelUp(false);

    // ダイアログを閉じる際に必ずmarkLevelUpSeenActionを呼び出す
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
    handleToastClose,
    handleAnimationComplete,
  };
}
