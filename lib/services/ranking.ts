import { createClient } from "@/lib/supabase/server";

export type UserRanking = {
  user_id: string;
  name: string | null;
  address_prefecture: string | null;
  xp: number;
  level: number;
  updated_at: string;
  rank: number;
};

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

export async function getUserRankings(limit = 50): Promise<UserRanking[]> {
  try {
    const response = await fetch("/api/ranking", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rankings: ${response.status}`);
    }

    const data = await response.json();
    return data.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch user rankings:", error);
    return [];
  }
}

export async function getCurrentUserRanking(
  userId: string,
): Promise<UserRanking | null> {
  try {
    const response = await fetch(`/api/ranking/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch current user ranking: ${response.status}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch current user ranking:", error);
    return null;
  }
}
