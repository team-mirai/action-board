import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";

export async function getMissionRanking(
  missionId: string,
  limit = 10,
): Promise<UserRanking[]> {
  try {
    const supabase = await createClient();

    // ミッション達成データを取得
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("user_id, created_at")
      .eq("mission_id", missionId)
      .order("created_at", { ascending: false });

    if (achievementsError) {
      console.error("Failed to fetch achievements:", achievementsError);
      throw new Error(
        `ミッションランキングデータの取得に失敗しました: ${achievementsError.message}`,
      );
    }

    // ユーザーごとの達成回数を集計
    const userCounts = new Map<string, number>();
    for (const achievement of achievements || []) {
      const userId = achievement.user_id;
      if (userId) {
        userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
      }
    }

    // 達成回数でソート
    const sortedUserIds = Array.from(userCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([userId]) => userId);

    if (sortedUserIds.length === 0) {
      return [];
    }

    // ユーザープロファイル情報を取得
    const { data: profiles, error: profilesError } = await supabase
      .from("public_user_profiles")
      .select("id, name, address_prefecture")
      .in("id", sortedUserIds);

    if (profilesError) {
      console.error("Failed to fetch user profiles:", profilesError);
      throw new Error(
        `ユーザープロファイルの取得に失敗しました: ${profilesError.message}`,
      );
    }

    // プロファイル情報をマップに変換
    const profileMap = new Map(
      (profiles || []).map((profile) => [profile.id, profile]),
    );

    // 最終的なランキングデータを作成
    return sortedUserIds.map((userId, index) => {
      const profile = profileMap.get(userId);
      return {
        user_id: userId,
        name: profile?.name ?? null,
        address_prefecture: profile?.address_prefecture ?? null,
        rank: index + 1,
        level: null,
        xp: null,
        updated_at: null,
        user_achievement_count: userCounts.get(userId) ?? 0,
      };
    });
  } catch (error) {
    console.error("Mission ranking service error:", error);
    throw error;
  }
}
