import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";

export async function getPrefecturesRanking(
  prefecture: string,
  limit = 10,
): Promise<UserRanking[]> {
  try {
    const supabase = await createClient();

    // データベース関数を使用して都道府県別ランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_prefecture_ranking",
      {
        prefecture: prefecture,
        limit_count: limit,
      },
    );

    if (rankingsError) {
      console.error("Failed to fetch prefecture rankings:", rankingsError);
      throw new Error(
        `都道府県ランキングデータの取得に失敗しました: ${rankingsError.message}`,
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
        }) as UserRanking,
    );
  } catch (error) {
    console.error("Prefecture ranking service error:", error);
    throw error;
  }
}

export async function getUserPrefecturesRanking(
  prefecture: string,
  userId: string,
): Promise<UserRanking | null> {
  try {
    const supabase = await createClient();

    // データベース関数を使用して特定ユーザーのランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_user_prefecture_ranking",
      {
        prefecture: prefecture,
        target_user_id: userId,
      },
    );

    if (rankingsError) {
      console.error("Failed to fetch user prefecture ranking:", rankingsError);
      throw new Error(
        `ユーザーの都道府県ランキングデータの取得に失敗しました: ${rankingsError.message}`,
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
    } as UserRanking;
  } catch (error) {
    console.error("User prefecture ranking service error:", error);
    throw error;
  }
}
