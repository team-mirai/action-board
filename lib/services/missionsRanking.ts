import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";

export interface UserMissionRanking extends UserRanking {
  user_achievement_count: number | null;
  total_points: number | null;
}

export async function getMissionRanking(
  missionId: string,
  limit = 10,
): Promise<UserMissionRanking[]> {
  try {
    const supabase = await createClient();

    // データベース関数を使用してランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_mission_ranking",
      {
        mission_id: missionId,
        limit_count: limit,
      },
    );

    if (rankingsError) {
      console.error("Failed to fetch mission rankings:", rankingsError);
      throw new Error(
        `ミッションランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || rankings.length === 0) {
      return [];
    }

    // ランキングデータを変換
    return rankings.map(
      (ranking) =>
        ({
          user_id: ranking.user_id,
          name: ranking.user_name,
          address_prefecture: ranking.address_prefecture,
          rank: ranking.rank,
          level: ranking.level,
          xp: ranking.xp,
          updated_at: ranking.updated_at,
          user_achievement_count: ranking.clear_count,
          total_points: ranking.total_points,
        }) as UserMissionRanking,
    );
  } catch (error) {
    console.error("Mission ranking service error:", error);
    throw error;
  }
}

export async function getUserMissionRanking(
  missionId: string,
  userId: string,
): Promise<UserMissionRanking | null> {
  try {
    const supabase = await createClient();

    // データベース関数を使用して特定ユーザーのランキングを取得
    const { data: rankings, error: rankingsError } = await supabase
      .rpc("get_user_mission_ranking", {
        mission_id: missionId,
        user_id: userId,
      })
      .limit(1);

    if (rankingsError) {
      console.error("Failed to fetch user mission ranking:", rankingsError);
      throw new Error(
        `ユーザーのミッションランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || rankings.length === 0) {
      return null;
    }

    const ranking = rankings[0];
    return {
      user_id: ranking.user_id,
      name: ranking.user_name,
      address_prefecture: ranking.address_prefecture,
      rank: ranking.rank,
      level: ranking.level,
      xp: ranking.xp,
      updated_at: ranking.updated_at,
      user_achievement_count: ranking.clear_count,
      total_points: ranking.total_points,
    } as UserMissionRanking;
  } catch (error) {
    console.error("User mission ranking service error:", error);
    throw error;
  }
}
