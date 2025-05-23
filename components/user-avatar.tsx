import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import type { HTMLProps } from "react";

interface UserProfile {
  name?: string | null;
  avatar_url?: string | null;
}

interface UserAvatarProps {
  userProfile: UserProfile;
  className?: HTMLProps<HTMLElement>["className"];
}

export default async function UserAvatar({
  className,
  userProfile,
}: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={userProfile.avatar_url || undefined}
        alt="プロフィール画像"
        style={{ objectFit: "cover" }}
      />
      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
        {userProfile.name?.substring(0, 1) ?? "ユ"}
      </AvatarFallback>
    </Avatar>
  );
}
