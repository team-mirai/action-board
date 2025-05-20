"use client";

import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  message: string;
  missionId: string;
  className?: string;
  url?: string;
};

export function ShareTwitterButton({
  children,
  message,
  missionId,
  className,
  url,
}: Props) {
  // SNSシェア用のハンドラ関数
  const shareUrl = url ?? `${window.location.origin}/missions/${missionId}`;
  const handleShare = () => {
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntentUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <Button variant="outline" onClick={handleShare} className={className}>
      {children}
    </Button>
  );
}
