import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function isValidReferralCode(code: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_referral")
    .select("user_id")
    .eq("referral_code", code)
    .eq("del_flg", false)
    .maybeSingle();
  return !!data;
}

export async function isEmailAlreadyUsedInReferral(
  email: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_artifacts")
    .select("id")
    .eq("artifact_type", "REFERRAL")
    .eq("text_content", email);
  return !!(data && data.length > 0);
}

const NANOID_REGEX = /^[a-zA-Z0-9@+*/#$%&!\-]{8}$/;

export const referralCodeSchema = z
  .string()
  .refine((val) => NANOID_REGEX.test(val), {
    message: "紹介リンクに誤りがあります。正しいリンクかどうかご確認ください。",
  });
