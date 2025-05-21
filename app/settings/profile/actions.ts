"use server";

import { createClient, createServiceClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

export async function updateProfile(
  state: UpdateProfileResult | null,
  formData: FormData,
): Promise<UpdateProfileResult | null> {
  const supabaseClient = await createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (!user) {
    console.error("User not found");
    return redirect("/sign-in");
  }

  const name = formData.get("name") as string;
  const address_prefecture = formData.get("address_prefecture") as string;
  const postcode = formData.get("postcode") as string;
  const x_username = formData.get("x_username") as string | null;

  const { data: authUser } = await supabaseClient.auth.getUser();
  const { data: privateUser } = await supabaseClient
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!authUser) {
    console.error("Public user not found");
    return redirect("/sign-in");
  }
  // private_users テーブルを更新
  if (!privateUser) {
    const { error: privateUserError } = await supabaseClient
      .from("private_users")
      .insert({
        id: user.id,
        name,
        address_prefecture,
        postcode,
        x_username,
        updated_at: new Date().toISOString(),
      });
    if (privateUserError) {
      console.error("Error updating private_users:", privateUserError);
      return {
        success: false,
        error: "ユーザー情報の登録に失敗しました",
      };
    }
  } else {
    const { error: privateUserError } = await supabaseClient
      .from("private_users")
      .update({
        name,
        address_prefecture,
        postcode,
        x_username,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (privateUserError) {
      console.error("Error updating private_users:", privateUserError);
      return {
        success: false,
        error: "ユーザー情報の更新に失敗しました",
      };
    }
  }

  revalidatePath("/settings/profile");
  return {
    success: true,
  };
}
