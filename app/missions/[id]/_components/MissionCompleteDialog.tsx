"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Tables } from "@/lib/types/supabase";
import { ShareButton } from "./ShareButton";
import { ShareFacebookButton } from "./ShareFacebookButton";
import { ShareLineButton } from "./ShareLineButton";
import { ShareTwitterButton } from "./ShareTwitterButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mission: Tables<"missions">;
};

export function MissionCompleteDialog({ isOpen, onClose, mission }: Props) {
  const message = `ミッション「${mission.title}」が完了しました！`;
  const shareMessage = `チームみらい Action Board で${message} #チームみらい\n`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            おめでとう！
          </DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <ShareTwitterButton
            message={shareMessage}
            missionId={mission.id}
            className="w-full"
          >
            Xでシェア
          </ShareTwitterButton>
          <ShareFacebookButton missionId={mission.id} className="w-full">
            Facebookでシェア
          </ShareFacebookButton>
          {/* 内部で判定しておりモバイルのみ表示 */}
          <ShareLineButton className="w-full md:hidden" missionId={mission.id}>
            Lineでシェア
          </ShareLineButton>
          {/* navigator.share()を使っているのでモバイルのみ表示 */}
          <ShareButton
            className="w-full md:hidden"
            message={shareMessage}
            missionId={mission.id}
          >
            その他のサービスにシェア
          </ShareButton>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
