import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // ユーザー情報を取得
  const { data: privateUser } = await supabase
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();

  // 新規ユーザーかどうか判定
  const isNew = Boolean(params.new);

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <ProfileForm
        isNew={isNew}
        initialProfile={{
          name: privateUser?.name || "",
          address_prefecture: privateUser?.address_prefecture || "",
          x_username: privateUser?.x_username || null,
          avatar_url: privateUser?.avatar_url || null,
        }}
        initialPrivateUser={privateUser}
      />
    </div>
  );
}
