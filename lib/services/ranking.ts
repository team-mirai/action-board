import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";

export type UserRanking = {
  user_id: string;
  name: string | null;
  address_prefecture: string | null;
  xp: number;
  level: number;
  updated_at: string;
  rank: number;
};

export async function getUserRankings(limit = 50): Promise<UserRanking[]> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("user_ranking_view")
    .select("*")
    .limit(limit);

  if (error) {
    console.error("Failed to fetch user rankings:", error);
    return [];
  }

  return data || [];
}
