import type { SupabaseClient } from "@supabase/supabase-js";

export function getAvatarUrl(
  client: SupabaseClient,
  avatarPath: string,
): string {
  const { data } = client.storage.from("avatars").getPublicUrl(avatarPath, {
    transform: {
      width: 240,
      height: 240,
      resize: "cover",
    },
  });
  return data.publicUrl;
}
