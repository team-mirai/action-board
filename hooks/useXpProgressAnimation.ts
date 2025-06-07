"use client";

import type { UserLevel } from "@/lib/services/userLevel";
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
  } | null>(null);
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    pointsToNextLevel: number;
  } | null>(null);

  const startXpAnimation = useCallback(
    (userLevel: UserLevel, xpGranted: number) => {
      setToastData({ userLevel, xpGranted });
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
    handleLevelUpDialogClose,
    handleToastClose,
    handleAnimationComplete,
  };
}
