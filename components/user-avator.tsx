import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/server";

export default async function UserAvator() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Avatar data-testid="avatar">
        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
          ユ
        </AvatarFallback>
      </Avatar>
    );
  }

  const { data: profile } = await supabase
    .from("private_users")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <Avatar data-testid="avatar" className="w-8 h-8">
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
