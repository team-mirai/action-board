"use client";

import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  missionId: string;
  className?: string;
  url?: string;
};

export function ShareFacebookButton({
  children,
  missionId,
  className,
  url,
}: Props) {
  const shareUrl = url ?? `${window.location.origin}/missions/${missionId}`;
  const handleShare = () => {
    const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button variant="outline" onClick={handleShare} className={className}>
      {children}
    </Button>
  );
}
