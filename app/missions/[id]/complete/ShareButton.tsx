"use client";

import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

type Props = {
  children: React.ReactNode;
  message: string;
  className?: string;
  url?: string;
};

export function ShareButton({ children, message, className, url }: Props) {
  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "チームみらい Action Board",
          text: message,
          url: shareUrl,
        });
      } catch (error) {
        // シェアがキャンセルされた場合やエラー時は何もしない
      }
    } else {
      alert("このブラウザはWebシェアAPIに対応していません。");
    }
  };
  return (
    <Button variant="outline" onClick={handleShare} className={className}>
      <Share className="w-4 h-4" />
      {children}
    </Button>
  );
}
