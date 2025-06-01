"use client";

import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  missionId: string;
  className?: string;
  url?: string;
};

const isMobile =
  typeof window !== "undefined" &&
  /iPhone|Android.+Mobile/.test(navigator.userAgent);

export function ShareLineButton({
  children,
  missionId,
  className,
  url,
}: Props) {
  // SNSシェア用のハンドラ関数
  const shareUrl = url ?? `${window.location.origin}/missions/${missionId}`;
  const handleShare = () => {
    const lineIntentUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineIntentUrl, "_blank", "noopener,noreferrer");
  };
  return (
    isMobile && (
      <Button variant="outline" onClick={handleShare} className={className}>
        {children}
      </Button>
    )
  );
}
