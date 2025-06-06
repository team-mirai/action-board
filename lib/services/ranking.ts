import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface UserRanking {
  user_id: string;
  name: string;
  address_prefecture: string;
  xp: number;
  level: number;
  updated_at: string;
  rank: number;
}

export async function getTop10Ranking(): Promise<UserRanking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_ranking_view")
    .select("*")
    .limit(10);

  if (error) {
    console.error("Failed to fetch ranking:", error);
    return [];
  }

  return data || [];
}
