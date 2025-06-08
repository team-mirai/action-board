import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface UserRanking {
  user_id: string | null;
  address_prefecture: string | null;
  level: number | null;
  name: string | null;
  rank: number | null;
  updated_at: string | null;
  xp: number | null;
}

export async function getRanking(limit = 10): Promise<UserRanking[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_ranking_view")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Failed to fetch ranking:", error);
      throw new Error(`ランキングデータの取得に失敗しました: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Ranking service error:", error);
    throw error;
  }
}
