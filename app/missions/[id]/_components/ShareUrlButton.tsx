"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type Props = {
  url: string;
  className?: string;
  children: React.ReactNode;
};

export function ShareUrlButton({ url, className, children }: Props) {
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URLをコピーしました！");
    } catch (error) {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("URLをコピーしました！");
    }
  };

  return (
    <Button onClick={handleCopyUrl} variant="outline" className={className}>
      <Copy className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}
