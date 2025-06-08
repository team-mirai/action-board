"use client";

import { calculateLevel, totalXp } from "@/lib/utils/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseXpAnimationProps {
  initialXp: number;
  xpGained: number;
  onLevelUp: (level: number) => void;
  onComplete: () => void;
  animationSpeed?: number; // XP per second
}

export function useXpAnimation({
  initialXp,
  xpGained,
  onLevelUp,
  onComplete,
  animationSpeed = 100, // 1秒間に100XP
}: UseXpAnimationProps) {
  const [currentXp, setCurrentXp] = useState(initialXp);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  // const [shouldResetProgress, setShouldResetProgress] = useState(false);

  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const pausedTimeRef = useRef<number>(0);
  const lastLevelRef = useRef<number>(calculateLevel(initialXp));
  const pausedXpRef = useRef<number>(initialXp);
  const currentSegmentStartRef = useRef<number>(initialXp);
  const currentSegmentTargetRef = useRef<number>(initialXp);

  const targetXp = initialXp + xpGained;

  const animate = useCallback(() => {
    if (!startTimeRef.current || isPaused) return;

    const segmentStart = currentSegmentStartRef.current;
    const segmentTarget = currentSegmentTargetRef.current;
    const segmentRange = segmentTarget - segmentStart;
    const segmentDuration = (segmentRange / animationSpeed) * 1000;

    const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
    const progress = Math.min(elapsed / segmentDuration, 1);

    // イージング関数（ease-out）
    const easeOut = 1 - (1 - progress) ** 3;
    const newXp = segmentStart + segmentRange * easeOut;

    setCurrentXp(newXp);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // セグメント完了
      setCurrentXp(segmentTarget);

      // レベルアップチェック
      const currentLevel = calculateLevel(segmentTarget);
      if (currentLevel > lastLevelRef.current) {
        // レベルアップ発生
        lastLevelRef.current = currentLevel;
        pausedXpRef.current = segmentTarget;
        onLevelUp(currentLevel);
        return;
      }

      // 次のセグメントがあるかチェック
      if (segmentTarget < targetXp) {
        // 次のセグメントを設定
        const nextLevel = calculateLevel(segmentTarget);
        const nextLevelStartXp = totalXp(nextLevel + 1);
        const nextSegmentTarget = Math.min(nextLevelStartXp, targetXp);

        currentSegmentStartRef.current = segmentTarget;
        currentSegmentTargetRef.current = nextSegmentTarget;

        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 全体のアニメーション完了
        setIsAnimating(false);
        setIsComplete(true);
        onComplete();
      }
    }
  }, [isPaused, animationSpeed, targetXp, onLevelUp, onComplete]);

  const startAnimation = useCallback(() => {
    if (xpGained <= 0) {
      setIsComplete(true);
      onComplete();
      return;
    }

    setIsAnimating(true);
    setIsPaused(false);
    setIsComplete(false);
    // setShouldResetProgress(false);
    setCurrentXp(initialXp);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    lastLevelRef.current = calculateLevel(initialXp);
    pausedXpRef.current = initialXp;

    // 最初のセグメントを設定（現在のレベルの最大XPまで）
    const currentLevel = calculateLevel(initialXp);
    const currentLevelMaxXp = totalXp(currentLevel + 1);
    const firstSegmentTarget = Math.min(currentLevelMaxXp, targetXp);

    currentSegmentStartRef.current = initialXp;
    currentSegmentTargetRef.current = firstSegmentTarget;

    animationRef.current = requestAnimationFrame(animate);
  }, [xpGained, initialXp, targetXp, animate, onComplete]);

  const pauseAnimation = useCallback(() => {
    if (isAnimating && !isPaused) {
      setIsPaused(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isAnimating, isPaused]);

  const resumeAnimation = useCallback(() => {
    if (isAnimating && isPaused) {
      setIsPaused(false);
      // setShouldResetProgress(true);

      // 新しいレベルの開始XPから再開
      const newStartXp = pausedXpRef.current;
      const newLevel = calculateLevel(newStartXp);

      // 次のセグメントのターゲットを設定
      const nextLevelMaxXp = totalXp(newLevel + 1);
      const nextSegmentTarget = Math.min(nextLevelMaxXp, targetXp);

      currentSegmentStartRef.current = newStartXp;
      currentSegmentTargetRef.current = nextSegmentTarget;

      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;

      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimating, isPaused, targetXp, animate]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setIsPaused(false);
    setIsComplete(true);
    setCurrentXp(targetXp);
    onComplete();
  }, [targetXp, onComplete]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    currentXp,
    isAnimating,
    isPaused,
    isComplete,
    // shouldResetProgress,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    stopAnimation,
  };
}
