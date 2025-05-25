import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";
import type { HTMLProps } from "react";

interface UserProfile {
  name?: string | null;
  avatar_url?: string | null;
}

interface UserAvatarProps {
  userProfile: UserProfile;
  className?: HTMLProps<HTMLElement>["className"];
}

export default function UserAvatar({
  className,
  userProfile,
}: UserAvatarProps) {
  const supabase = createClient();
  let avatarUrl = userProfile.avatar_url;
  if (avatarUrl) {
    avatarUrl = getAvatarUrl(supabase, avatarUrl);
  }
  return (
    <Avatar className={className}>
      <AvatarImage
        src={avatarUrl || undefined}
        alt="プロフィール画像"
        style={{ objectFit: "cover" }}
      />
      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
        {userProfile.name?.substring(0, 1) ?? "ユ"}
      </AvatarFallback>
    </Avatar>
  );
}
