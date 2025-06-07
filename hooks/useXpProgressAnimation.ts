"use client";

import type { UserLevel } from "@/lib/services/userLevel";
import { calculateLevel, totalXp } from "@/lib/utils/utils";
import { useCallback, useState } from "react";

interface UseXpProgressAnimationProps {
  onLevelUp?: (newLevel: number, pointsToNextLevel: number) => void;
}

export function useXpProgressAnimation({
  onLevelUp,
}: UseXpProgressAnimationProps = {}) {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastData, setToastData] = useState<{
    userLevel: UserLevel;
    xpGranted: number;
    startLevel: number;
    startLevelStartXp: number;
    nextLevelRequiredXp: number;
    xpRangeForCurrentLevel: number;
  } | null>(null);
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    pointsToNextLevel: number;
  } | null>(null);

  const startXpAnimation = useCallback(
    (userLevel: UserLevel, xpGranted: number) => {
      const startXp = userLevel.xp - xpGranted;
      const startLevel = calculateLevel(startXp);
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
      });
      setIsToastOpen(true);
    },
    [],
  );

  const handleLevelUp = useCallback(
    (newLevel: number, pointsToNextLevel: number) => {
      setLevelUpData({ newLevel, pointsToNextLevel });
      setIsLevelUpDialogOpen(true);
      onLevelUp?.(newLevel, pointsToNextLevel);
    },
    [onLevelUp],
  );

  const checkLevelUp = useCallback(
    (currentXp: number, endXp: number, nextLevelRequiredXp: number) => {
      if (currentXp >= nextLevelRequiredXp) {
        const finalLevel = calculateLevel(endXp);
        const finalLevelStartXp = totalXp(finalLevel);
        const finalNextLevelRequiredXp = totalXp(finalLevel + 1);
        const pointsToNextLevel = finalNextLevelRequiredXp - endXp;

        setLevelUpData({ newLevel: finalLevel, pointsToNextLevel });
        setIsLevelUpDialogOpen(true);
        onLevelUp?.(finalLevel, pointsToNextLevel);
        return true;
      }
      return false;
    },
    [onLevelUp],
  );

  const handleLevelUpDialogClose = useCallback(() => {
    setIsLevelUpDialogOpen(false);
    setLevelUpData(null);
  }, []);

  const handleToastClose = useCallback(() => {
    setIsToastOpen(false);
    setToastData(null);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setIsToastOpen(false);
      setToastData(null);
    }, 1000);
  }, []);

  return {
    isToastOpen,
    toastData,
    isLevelUpDialogOpen,
    levelUpData,
    startXpAnimation,
    handleLevelUp,
    checkLevelUp,
    handleLevelUpDialogClose,
    handleToastClose,
    handleAnimationComplete,
  };
}
