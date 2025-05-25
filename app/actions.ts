"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateAge, encodedRedirect } from "@/lib/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { z } from "zod";

const signUpAndLoginFormSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "メールアドレスを入力してください" })
    .email({ message: "有効なメールアドレスを入力してください" }),
  password: z
    .string()
    .nonempty({ message: "パスワードを入力してください" })
    .min(6, { message: "パスワードは8文字以上で入力してください" }),
  date_of_birth: z
    .string()
    .nonempty({ message: "生年月日を入力してください" })
    .refine(
      (value) => {
        const age = calculateAge(value);
        return age >= 18;
      },
      {
        message: "18歳未満の方は登録できません",
      },
    )
    .transform((value) => new Date(value).toISOString()), // ISO形式に変換
});

const signInAndLoginFormSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "メールアドレスを入力してください" })
    .email({ message: "有効なメールアドレスを入力してください" }),
  password: z
    .string()
    .nonempty({ message: "パスワードを入力してください" })
    .min(6, { message: "パスワードは8文字以上で入力してください" }),
});

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const date_of_birth = formData.get("date_of_birth")?.toString();

  const validatedFields = signUpAndLoginFormSchema.safeParse({
    email,
    password,
    date_of_birth,
  });
  if (!validatedFields.success) {
    return encodedRedirect(
      "error",
      "/sign-up",
      validatedFields.error.errors.map((error) => error.message).join("\n"),
    );
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
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
    console.error(`${error.code} ${error.message}`);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "参画頂きありがとうございます！\n" +
      "認証メールをお送りしました。\n" +
      "メールに記載のURLをクリックして、アカウントを有効化してください。",
  );
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
      validatedFields.error.errors.map((error) => error.message).join("\n"),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log(error);

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/");
};

const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "メールアドレスを入力してください" })
    .email({ message: "有効なメールアドレスを入力してください" }),
});

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
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
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
