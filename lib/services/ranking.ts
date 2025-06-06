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
