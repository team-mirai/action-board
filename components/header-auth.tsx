import { signOutAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("private_users")
    .select("name")
    .single();

  return user && profile ? (
    <div className="flex items-center gap-4">
      {profile.name}
      <form action={signOutAction}>
        <Button size="sm" type="submit" variant={"outline"}>
          ログアウト
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">ログイン</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">サインアップ</Link>
      </Button>
    </div>
  );
}
