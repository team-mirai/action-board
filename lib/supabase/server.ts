"use server";

import type { Database } from "@/lib/types/supabase";
import { createServerClient } from "@supabase/ssr";
import { createClient as createClientSupabase } from "@supabase/supabase-js";

import { cookies } from "next/headers";

// サービスロールでの操作を行うクライアントです。
// RLSが無効になりますのでご注意ください。
export const createServiceClient = async () => {
  return createClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  );
};

export const createClient = async () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
