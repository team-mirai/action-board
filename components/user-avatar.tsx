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
  let avatarUrl = userProfile.avatar_url;
  if (avatarUrl) {
    const supabase = createClient();
    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarUrl, {
      transform: {
        width: 240,
        height: 240,
        resize: "cover",
      },
    });
    avatarUrl = data.publicUrl;
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
