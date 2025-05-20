"use client";

import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  message: string;
  className?: string;
  url?: string;
};

export function ShareTwitterButton({
  children,
  message,
  className,
  url,
}: Props) {
  // SNSシェア用のハンドラ関数
  const shareUrl = url ?? window.location.origin;
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
