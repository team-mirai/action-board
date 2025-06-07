"use client";

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { totalXp } from "@/lib/utils/utils";
import React, { useEffect, useState } from "react";

import type { UserLevel } from "@/lib/services/userLevel";

interface XpProgressToastProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userLevel: UserLevel;
  xpGranted: number;
  onLevelUp?: (newLevel: number, pointsToNextLevel: number) => void;
  onAnimationComplete?: () => void;
}

export function XpProgressToast({
  isOpen,
  onOpenChange,
  userLevel,
  xpGranted,
  onLevelUp,
  onAnimationComplete,
}: XpProgressToastProps) {
  const [animatedXp, setAnimatedXp] = useState(userLevel.xp - xpGranted);
  const [hasTriggeredLevelUp, setHasTriggeredLevelUp] = useState(false);

  const currentLevel = userLevel.level;
  const currentLevelStartXp = totalXp(currentLevel);
  const nextLevelRequiredXp = totalXp(currentLevel + 1);
  const xpRangeForCurrentLevel = nextLevelRequiredXp - currentLevelStartXp;

  useEffect(() => {
    if (!isOpen) return;

    const startXp = userLevel.xp - xpGranted;
    const endXp = userLevel.xp;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - (1 - progress) ** 4;
      const currentXp = startXp + (endXp - startXp) * easeOutQuart;

      setAnimatedXp(currentXp);

      const animatedLevel =
        Math.floor(
          ((currentXp - currentLevelStartXp) / xpRangeForCurrentLevel) * 100,
        ) / 100;
      const targetLevel =
        Math.floor(
          ((endXp - currentLevelStartXp) / xpRangeForCurrentLevel) * 100,
        ) / 100;

      if (
        !hasTriggeredLevelUp &&
        currentXp >= nextLevelRequiredXp &&
        onLevelUp
      ) {
        setHasTriggeredLevelUp(true);
        const newLevel = currentLevel + 1;
        const newLevelStartXp = totalXp(newLevel);
        const newNextLevelRequiredXp = totalXp(newLevel + 1);
        const pointsToNextLevel = newNextLevelRequiredXp - endXp;
        onLevelUp(newLevel, pointsToNextLevel);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onAnimationComplete?.();
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    userLevel.xp,
    xpGranted,
    currentLevel,
    currentLevelStartXp,
    nextLevelRequiredXp,
    xpRangeForCurrentLevel,
    hasTriggeredLevelUp,
    onLevelUp,
    onAnimationComplete,
  ]);

  const progressInCurrentLevel = Math.max(0, animatedXp - currentLevelStartXp);
  const progressPercentage = Math.min(
    (progressInCurrentLevel / xpRangeForCurrentLevel) * 100,
    100,
  );

  return (
    <ToastProvider>
      <Toast open={isOpen} onOpenChange={onOpenChange} className="w-[268px]">
        <div className="flex flex-col space-y-2">
          <ToastTitle className="text-sm font-bold">
            +{xpGranted}XP獲得！
          </ToastTitle>
          <ToastDescription className="text-xs text-gray-600">
            次のレベルまで{" "}
            {Math.max(0, Math.ceil(nextLevelRequiredXp - animatedXp))}XP
          </ToastDescription>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium">Lv.{currentLevel}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-100 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium">Lv.{currentLevel + 1}</span>
          </div>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}
