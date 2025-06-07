"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import React from "react";

interface LevelUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  pointsToNextLevel?: number;
}

export function LevelUpDialog({
  isOpen,
  onClose,
  newLevel,
  pointsToNextLevel = 640,
}: LevelUpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-xs bg-white rounded-2xl border-0 shadow-2xl"
        style={{ width: "90vw", maxWidth: "360px" }}
      >
        <DialogTitle className="text-4xl font-bold text-gray-800 text-center">
          Level UP!
        </DialogTitle>
        <div className="flex flex-col items-center">
          <div className="relative mt-3 mb-8">
            <Image
              alt="particle"
              src="/img/level-up-particle.png"
              width="230"
              height="96"
              style={{
                position: "absolute",
                top: 8,
                left: -45,
                width: 230,
                maxWidth: "none",
              }}
            />
            <div
              className="rounded-full flex items-center justify-center bg-gradient-level"
              style={{ width: 134, height: 134 }}
            >
              <div className="text-center">
                <div className="text-white text-lg font-medium tracking-wider leading-none">
                  LEVEL
                </div>
                <div
                  className="text-white text-8xl font-bold leading-none"
                  style={{ lineHeight: 0.85 }}
                >
                  {newLevel}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-2">
            <p className="font-bold text-gray-800 mb-3">
              ナイスアクションでレベルアップ！
            </p>
            <p className="text-gray-600">
              次のレベルまで
              <span className="text-lg font-bold">
                {pointsToNextLevel}ポイント
              </span>
              <span>🔥</span>
            </p>
          </div>

          <div
            className=" bg-gray-200 rounded-full h-3 mb-2 shadow-inner"
            style={{ width: 248 }}
          >
            <div className="bg-gray-400 h-3 rounded-full w-1/3 shadow-sm" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
