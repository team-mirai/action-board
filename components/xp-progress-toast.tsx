"use client";

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { calculateLevel, totalXp } from "@/lib/utils/utils";
import React, { useEffect, useState } from "react";

import type { UserLevel } from "@/lib/services/userLevel";

interface XpProgressToastProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userLevel: UserLevel;
  xpGranted: number;
  startLevel: number;
  startLevelStartXp: number;
  nextLevelRequiredXp: number;
  xpRangeForCurrentLevel: number;
  onLevelUp?: (
    currentXp: number,
    endXp: number,
    nextLevelRequiredXp: number,
  ) => boolean;
  onAnimationComplete?: () => void;
}

export function XpProgressToast({
  isOpen,
  onOpenChange,
  userLevel,
  xpGranted,
  startLevel,
  startLevelStartXp,
  nextLevelRequiredXp,
  xpRangeForCurrentLevel,
  onLevelUp,
  onAnimationComplete,
}: XpProgressToastProps) {
  const [animatedXp, setAnimatedXp] = useState(userLevel.xp - xpGranted);
  const [hasTriggeredLevelUp, setHasTriggeredLevelUp] = useState(false);

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

      if (
        !hasTriggeredLevelUp &&
        onLevelUp &&
        onLevelUp(currentXp, endXp, nextLevelRequiredXp)
      ) {
        setHasTriggeredLevelUp(true);
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
    nextLevelRequiredXp,
    hasTriggeredLevelUp,
    onLevelUp,
    onAnimationComplete,
  ]);

  const progressInCurrentLevel = Math.max(0, animatedXp - startLevelStartXp);
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
            <span className="text-xs font-medium">Lv.{startLevel}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-100 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium">Lv.{startLevel + 1}</span>
          </div>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}
