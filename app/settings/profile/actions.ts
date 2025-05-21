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
  const supabaseServiceClient = await createServiceClient();
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
  const x_username = formData.get("x_username") as string | null;

  // private_users テーブルを更新
  const { error: privateUserError } = await supabaseServiceClient
    .from("private_users")
    .update({
      name,
      address_prefecture,
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

  revalidatePath("/settings/profile");
  return {
    success: true,
  };
}
