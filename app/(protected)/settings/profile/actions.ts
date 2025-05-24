// filepath: /home/seiichi3141/apps/team-mirai/action-board/app/(protected)/settings/profile/actions.ts
"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

export type UploadAvatarResult = {
  success: boolean;
  avatarPath?: string;
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

  // 先にユーザー情報を取得
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

  const name = formData.get("name") as string;
  const address_prefecture = formData.get("address_prefecture") as string;
  const postcode = formData.get("postcode") as string;
  const x_username = formData.get("x_username") as string | null;

  // フォームから送信されたavatar_url
  let avatar_path = formData.get("avatar_path") as string | null;

  // 以前の画像URL
  const previousAvatarUrl = privateUser?.avatar_url || null;

  // 画像ファイルが送信されているか確認
  const avatar_file = formData.get("avatar") as File | null;

  // 古い画像を削除するかチェック:
  // 1. 画像が削除された場合（avatar_urlがnullになった）
  // 2. 新しい画像がアップロードされる場合
  const shouldDeleteOldAvatar =
    previousAvatarUrl &&
    (avatar_path === null || (avatar_file && avatar_file.size > 0));

  if (shouldDeleteOldAvatar) {
    try {
      // URLからファイルパスを抽出
      // 例: https://xxxx.supabase.co/storage/v1/object/public/avatars/userid/12345.jpg
      const pathMatch = previousAvatarUrl.match(/\/avatars\/(.+)$/);

      if (pathMatch?.[1]) {
        const filePath = pathMatch[1];
        // 古い画像をストレージから削除
        const { error: deleteError } = await supabaseServiceClient.storage
          .from("avatars")
          .remove([filePath]);

        if (deleteError) {
          console.error("Error deleting old avatar:", deleteError);
        } else {
          console.log("Successfully deleted old avatar:", filePath);
        }
      }
    } catch (error) {
      console.error("Error deleting old avatar:", error);
      // 画像削除に失敗しても、更新処理は継続する
    }
  }

  // 新しい画像をアップロード
  if (avatar_file && avatar_file.size > 0) {
    try {
      // ユーザーIDを取得
      const userId = privateUser?.id || crypto.randomUUID();

      // ファイル名の生成
      const fileExt = avatar_file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // ファイルのバイナリデータを取得
      const fileBuffer = await avatar_file.arrayBuffer();

      // Supabase Storageにアップロード
      const { error } = await supabaseServiceClient.storage
        .from("avatars")
        .upload(fileName, fileBuffer, {
          contentType: avatar_file.type,
          upsert: true,
        });

      if (error) {
        console.error("Upload error:", error);
        // アップロードに失敗しても、他のプロフィール情報は更新を続ける
      } else {
        // 公開URLを取得して保存用に設定
        const { data } = supabaseServiceClient.storage
          .from("avatars")
          .getPublicUrl(fileName);
      }
      avatar_path = fileName;
    } catch (error) {
      console.error("Avatar upload error during profile update:", error);
      // エラーがあっても他のプロフィール情報の更新は続ける
    }
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
        avatar_url: avatar_path,
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
        avatar_url: avatar_path,
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

export async function uploadAvatar(
  _: unknown,
  formData: FormData,
): Promise<UploadAvatarResult> {
  try {
    const supabase = await createServiceClient();
    const supabaseClient = await createClient();

    // ユーザー情報の取得
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      return { success: false, error: "ユーザーが見つかりません" };
    }

    // ユーザーのプライベート情報を取得(UUIDを特定するため)
    const { data: privateUser } = await supabaseClient
      .from("private_users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!privateUser) {
      return { success: false, error: "ユーザープロフィールが未登録です" };
    }

    // フォームからファイルを取得
    const file = formData.get("avatar") as File;
    if (!file) {
      return { success: false, error: "ファイルが選択されていません" };
    }

    // ファイル名の生成
    const fileExt = file.name.split(".").pop();
    const fileName = `${privateUser.id}/${Date.now()}.${fileExt}`;

    // ファイルのバイナリデータを取得
    const fileBuffer = await file.arrayBuffer();

    // Supabase Storageにアップロード
    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: "アップロードに失敗しました" };
    }

    // 公開URLを取得
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

    return {
      success: true,
      avatarPath: fileName,
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return {
      success: false,
      error: "画像のアップロード中にエラーが発生しました",
    };
  }
}
