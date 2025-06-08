// hooks/useXpProgressAnimation.ts - ログ付きバージョン
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
  IDLE = "idle",
  TOAST_SHOWING = "toast",
  DIALOG_SHOWING = "dialog",
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
    console.log(
      "🎉 🎉 [XpAnimation] Animation complete, checking for level up",
    );
    // ここに詳細な状態確認ログを追加
    console.log("🔍 [XpAnimation] Current state check", {
      willLevelUp,
      hasToastData: !!toastData,
      toastDataDetails: toastData
        ? {
            userLevel: toastData.userLevel.xp,
            xpGranted: toastData.xpGranted,
            startLevel: toastData.startLevel,
            isMultiLevel: toastData.isMultiLevel,
            finalLevel: toastData.finalLevel,
          }
        : null,
      currentAnimationState: animationState,
    });
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
  }, [willLevelUp, toastData, showLevelUpDialog, animationState]);

  const checkLevelUp = useCallback(
    (
      currentXp: number,
      endXp: number,
      nextLevelRequiredXp: number,
      isMultiLevel?: boolean,
      finalLevel?: number,
    ) => {
      // console.log("🔍 [LevelCheck] checkLevelUp called", {
      //   currentXp,
      //   endXp,
      //   nextLevelRequiredXp,
      //   isMultiLevel,
      //   finalLevel,
      //   timestamp: new Date().toISOString()
      // });

      // 現在は常にfalseを返しているが、実際のレベルアップ判定ロジックがここにあるべき
      return false;
    },
    [],
  );

  // useXpProgressAnimation.ts の修正版

  const startXpAnimation = useCallback(
    (userLevel: UserLevel, xpGranted: number) => {
      console.log("🚀 [XpAnimation] Starting XP animation", {
        currentXp: userLevel.xp,
        xpGranted,
        currentLevel: userLevel.level,
        timestamp: new Date().toISOString(),
      });

      const startXp = userLevel.xp - xpGranted;
      const endXp = userLevel.xp;
      const startLevel = calculateLevel(startXp);
      const finalLevel = calculateLevel(endXp);

      console.log("🔢 [XpAnimation] Level calculation", {
        startXp,
        endXp,
        startLevel,
        finalLevel,
        levelUpWillOccur: finalLevel > startLevel,
      });

      const levelUpWillOccur = finalLevel > startLevel;

      console.log("🏁 [XpAnimation] Setting willLevelUp flag", {
        previousWillLevelUp: willLevelUp,
        newWillLevelUp: levelUpWillOccur,
        startLevel,
        finalLevel,
      });

      // 状態を一括で設定
      const startLevelStartXp = totalXp(startLevel);
      const nextLevelRequiredXp = totalXp(startLevel + 1);
      const xpRangeForCurrentLevel = nextLevelRequiredXp - startLevelStartXp;

      const newToastData = {
        userLevel,
        xpGranted,
        startLevel,
        startLevelStartXp,
        nextLevelRequiredXp,
        xpRangeForCurrentLevel,
        isMultiLevel: false,
      };

      console.log("📊 [XpAnimation] Setting toast data and willLevelUp", {
        levelUpWillOccur,
        toastData: newToastData,
      });

      // 重要: 状態を同時に設定
      setWillLevelUp(levelUpWillOccur);
      setToastData(newToastData);
      setAnimationState(AnimationState.TOAST_SHOWING);

      // handleAnimationCompleteコールバックを事前に作成（クロージャで値を保持）
      const animationCompleteHandler = () => {
        console.log(
          "🔄 [Animation] handleAnimationComplete called with captured values",
          {
            capturedWillLevelUp: levelUpWillOccur,
            capturedToastData: !!newToastData,
            timestamp: new Date().toISOString(),
          },
        );

        if (levelUpWillOccur && newToastData) {
          console.log(
            "✅ [Animation] Conditions met (using captured values), proceeding with level up dialog",
          );

          setTimeout(() => {
            console.log("⏰ [Animation] First timeout (1000ms) executed");
            setAnimationState(AnimationState.IDLE);

            setTimeout(() => {
              console.log("⏰ [Animation] Second timeout (300ms) executed");

              const endXp = newToastData.userLevel.xp;
              const finalLevel = calculateLevel(endXp);
              const finalLevelStartXp = totalXp(finalLevel);
              const finalNextLevelRequiredXp = totalXp(finalLevel + 1);
              const pointsToNextLevel = finalNextLevelRequiredXp - endXp;

              console.log("🧮 [Animation] Level calculation results", {
                endXp,
                finalLevel,
                finalLevelStartXp,
                finalNextLevelRequiredXp,
                pointsToNextLevel,
              });

              console.log("🚀 [Animation] About to call showLevelUpDialog");
              showLevelUpDialog(finalLevel, pointsToNextLevel);
            }, 300);
          }, 1000);
        } else {
          console.log(
            "❌ [Animation] No level up (using captured values), cleaning up",
          );

          setTimeout(() => {
            console.log("⏰ [Animation] Cleanup timeout executed");
            setAnimationState(AnimationState.IDLE);
            setToastData(null);
            setWillLevelUp(false);
          }, 1000);
        }
      };

      // トースト表示（クロージャで作成したコールバックを使用）
      import("@/components/xp-progress-toast-sonner").then(
        ({ showXpProgressToast }) => {
          console.log("📱 [XpAnimation] Showing progress toast");
          showXpProgressToast({
            userLevel,
            xpGranted,
            startLevel,
            startLevelStartXp,
            nextLevelRequiredXp,
            xpRangeForCurrentLevel,
            isMultiLevel: false,
            onLevelUp: checkLevelUp,
            onAnimationComplete: animationCompleteHandler, // クロージャを使用
          });
        },
      );

      console.log("📱 [XpAnimation] Animation state set to TOAST_SHOWING");
    },
    [checkLevelUp, showLevelUpDialog, willLevelUp], // handleAnimationCompleteの依存を削除
  );

  const handleLevelUp = useCallback(
    async (newLevel: number, pointsToNextLevel: number) => {
      console.log("🎉 [LevelUp] handleLevelUp called (legacy method)", {
        newLevel,
        pointsToNextLevel,
      });

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
