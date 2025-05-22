import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { User2Icon } from "lucide-react";
import type { HTMLProps } from "react";

interface UserAvatarProps {
  userId: string | null;
  className?: HTMLProps<HTMLElement>["className"];
}

export default async function UserAvatar({
  userId,
  className,
}: UserAvatarProps) {
  const supabase = await createClient();

  if (!userId) {
    return (
      <Avatar className={className}>
        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
          <User2Icon />
        </AvatarFallback>
      </Avatar>
    );
  }

  const { data: profile } = await supabase
    .from("public_user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    return (
      <Avatar className={className}>
        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
          ユ
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={className}>
      <AvatarImage
        src={profile?.avatar_url || undefined}
        alt="プロフィール画像"
        style={{ objectFit: "cover" }}
      />
      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
        {profile?.name.substring(0, 1) ?? "ユ"}
      </AvatarFallback>
    </Avatar>
  );
}
