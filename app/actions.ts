"use server";

import { initializeUserLevel } from "@/lib/services/userLevel";
import { createClient } from "@/lib/supabase/server";
import { calculateAge, encodedRedirect } from "@/lib/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  forgotPasswordFormSchema,
  signInAndLoginFormSchema,
  signUpAndLoginFormSchema,
} from "@/lib/validation/auth";

// useActionState用のサインアップアクション
export const signUpActionWithState = async (
  prevState: {
    error?: string;
    success?: string;
    message?: string;
    formData?: {
      email: string;
      password: string;
      date_of_birth: string;
      terms_agreed: boolean;
      privacy_agreed: boolean;
    };
  } | null,
  formData: FormData,
) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const date_of_birth = formData.get("date_of_birth")?.toString();
  const terms_agreed = formData.get("terms_agreed")?.toString();
  const privacy_agreed = formData.get("privacy_agreed")?.toString();

  // フォームデータを保存（エラー時の状態復元用）
  const currentFormData = {
    email: email || "",
    password: password || "",
    date_of_birth: date_of_birth || "",
    terms_agreed: terms_agreed === "true",
    privacy_agreed: privacy_agreed === "true",
  };

  const validatedFields = signUpAndLoginFormSchema.safeParse({
    email,
    password,
    date_of_birth,
  });
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors
        .map((error) => error.message)
        .join("\n"),
      formData: currentFormData,
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードが必要です",
      formData: currentFormData,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        date_of_birth, // 生年月日をユーザーデータに保存。プロフィール作成時に固定で設定される
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    let message = error.message;
    if (error.code === "user_already_exists") {
      message = "このメールアドレスはすでに使用されています。";
    }
    return {
      error: message,
      formData: currentFormData,
    };
  }

  if (data.user?.id) {
    try {
      await initializeUserLevel(data.user.id);
    } catch (levelError) {
      console.error("Failed to initialize user level:", levelError);
    }
  }

  // 成功時はリダイレクトする
  return encodedRedirect("success", "/sign-up-success", "登録が完了しました。");
};

// useActionState用のサインインアクション
export const signInActionWithState = async (
  prevState: {
    error?: string;
    success?: string;
    message?: string;
    formData?: {
      email: string;
    };
  } | null,
  formData: FormData,
) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // フォームデータを保存（エラー時の状態復元用、メールアドレスのみ）
  const currentFormData = {
    email: email || "",
  };

  const validatedFields = signInAndLoginFormSchema.safeParse({
    email,
    password,
  });
  if (!validatedFields.success) {
    return {
      error: "メールアドレスまたはパスワードが間違っています",
      formData: currentFormData,
    };
  }

  if (!email || !password) {
    return {
      error: "メールアドレスまたはパスワードが間違っています",
      formData: currentFormData,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: "メールアドレスまたはパスワードが間違っています",
      formData: currentFormData,
    };
  }

  return redirect("/");
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signInAndLoginFormSchema.safeParse({
    email,
    password,
  });
  if (!validatedFields.success) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "メールアドレスまたはパスワードが間違っています",
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "メールアドレスまたはパスワードが間違っています",
    );
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "メールアドレスが必要です",
    );
  }

  const validatedFields = forgotPasswordFormSchema.safeParse({ email });
  if (!validatedFields.success) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      validatedFields.error.errors.map((error) => error.message).join("\n"),
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "パスワードリセットに失敗しました",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "パスワードリセット用のリンクをメールでお送りしました。",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "パスワードとパスワード確認が必要です",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect("error", "/reset-password", "パスワードが一致しません");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/reset-password",
      "パスワードの更新に失敗しました",
    );
  }

  encodedRedirect("success", "/reset-password", "パスワードを更新しました");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
