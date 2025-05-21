"use client";

import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useState } from "react";
import { PrefectureSelect } from "./PrefectureSelect";
import { updateProfile } from "./actions";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<{
    name: string;
    address_prefecture: string;
    x_username: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [privateUser, setPrivateUser] = useState<{
    postcode: string;
  } | null>(null);
  const router = useRouter();
  // nameが空文字列なら新規登録とみなす
  const isNew = profile?.name === "";

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    const { data: privateUser } = await supabase
      .from("private_users")
      .select("*")
      .eq("auth_id", user.id)
      .single();
    setPrivateUser(privateUser);
    if (!privateUser) {
      return;
    }
    const { data } = await supabase
      .from("public_user_profiles")
      .select("name, address_prefecture, x_username")
      .eq("id", privateUser.id)
      .single();
    setProfile(data);
    setLoading(false);
  }, [router.replace]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 追加: stateが変化したら再取得
  useEffect(() => {
    if (state) {
      fetchProfile();
    }
  }, [state, fetchProfile]);

  useEffect(() => {
    if (state && isNew && state.success) {
      router.push("/");
    }
  }, [state, isNew, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
          <CardDescription>
            {isNew
              ? "公開されるプロフィール情報を登録します。"
              : "公開されるプロフィール情報を編集します。"}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={profile?.name || ""}
                required
                disabled={isPending || isRefreshing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_prefecture">都道府県</Label>
              <PrefectureSelect
                name="address_prefecture"
                id="address_prefecture"
                defaultValue={profile?.address_prefecture || ""}
                required
                disabled={isPending || isRefreshing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">郵便番号(ハイフンなし7桁)</Label>
              <p className="text-sm text-gray-500">この項目は公開されません</p>
              <Input
                id="postcode"
                name="postcode"
                type="text"
                defaultValue={privateUser?.postcode || ""}
                required
                disabled={isPending || isRefreshing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="x_username">
                X (旧Twitter) ユーザー名(オプション)
              </Label>
              <Input
                id="x_username"
                name="x_username"
                type="text"
                defaultValue={profile?.x_username || ""}
                disabled={isPending || isRefreshing}
              />
            </div>
            {state && (
              <p className="text-center text-sm text-green-600">
                {isNew
                  ? "プロフィールを新規登録しました。"
                  : "プロフィールを更新しました。"}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton
              className="w-full"
              disabled={isPending || isRefreshing}
            >
              {isNew ? "登録する" : "更新する"}
            </SubmitButton>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
