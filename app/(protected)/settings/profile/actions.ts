"use server";

import { PREFECTURES } from "@/lib/address";
import { AVATAR_MAX_FILE_SIZE } from "@/lib/avatar";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { encodedRedirect } from "@/lib/utils/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

export type UploadAvatarResult = {
  success: boolean;
  avatarPath?: string;
  error?: string;
};

const updateProfileFormSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "ニックネームを入力してください" })
    .max(100, { message: "ニックネームは100文字以内で入力してください" }),
  address_prefecture: z
    .string()
    .nonempty({ message: "都道府県を選択してください" })
    .refine((val) => PREFECTURES.includes(val), {
      message: "有効な都道府県を選択してください",
    }),
  date_of_birth: z
    .string()
    .nonempty({ message: "生年月日を入力してください" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "生年月日はYYYY-MM-DD形式で入力してください",
    }),
  postcode: z
    .string()
    .nonempty({ message: "郵便番号を入力してください" })
    .regex(/^\d{7}$/, {
      message: "郵便番号はハイフンなし7桁で入力してください",
    }),
  x_username: z
    .string()
    .max(50, { message: "Xユーザー名は50文字以内で入力してください" })
    .optional(),
});

export async function updateProfile(
  previousState: UpdateProfileResult | null,
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

  // フォームデータの取得
  const name = formData.get("name")?.toString();
  const address_prefecture = formData.get("address_prefecture")?.toString();
  const date_of_birth = formData.get("date_of_birth")?.toString();
  const postcode = formData.get("postcode")?.toString();
  const x_username = formData.get("x_username")?.toString() || "";

  // バリデーション
  const validatedFields = updateProfileFormSchema.safeParse({
    name,
    address_prefecture,
    date_of_birth,
    postcode,
    x_username,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors
        .map((error) => error.message)
        .join("\n"),
    };
  }

  // バリデーション済みのデータを使用
  const validatedData = validatedFields.data;

  // 先にユーザー情報を取得
  const { data: authUser } = await supabaseClient.auth.getUser();
  const { data: privateUser } = await supabaseClient
    .from("private_users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!authUser) {
    console.error("Public user not found");
    return encodedRedirect("error", "/sign-in", "ユーザーが見つかりません");
  }

  // フォームから送信されたavatar_url
  let avatar_path = formData.get("avatar_path") as string | null;

  // 以前の画像URL
  const previousAvatarUrl = privateUser?.avatar_url || null;

  // 画像ファイルが送信されているか確認
  const avatar_file = formData.get("avatar") as File | null;

  // 画像ファイルのバリデーション
  if (avatar_file && avatar_file.size > 0) {
    // ファイルサイズのチェック
    if (avatar_file.size > AVATAR_MAX_FILE_SIZE) {
      return {
        success: false,
        error: "画像ファイルのサイズは5MB以下にしてください",
      };
    }

    // ファイルタイプのチェック
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(avatar_file.type)) {
      return {
        success: false,
        error: "対応している画像形式はJPEG、PNG、WebPです",
      };
    }
  }

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
        name: validatedData.name,
        address_prefecture: validatedData.address_prefecture,
        date_of_birth: validatedData.date_of_birth,
        postcode: validatedData.postcode,
        x_username: validatedData.x_username || null,
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
        name: validatedData.name,
        address_prefecture: validatedData.address_prefecture,
        date_of_birth: validatedData.date_of_birth,
        postcode: validatedData.postcode,
        x_username: validatedData.x_username || null,
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
