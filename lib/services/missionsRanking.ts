import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";

export interface UserMissionRanking extends UserRanking {
  user_achievement_count: number | null;
}

export async function getMissionRanking(
  missionId: string,
  limit = 10,
): Promise<UserMissionRanking[]> {
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

    // 全てのユーザーを取得
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from("public_user_profiles")
      .select("id, name, address_prefecture");

    if (allProfilesError) {
      console.error("Failed to fetch all user profiles:", allProfilesError);
      throw new Error(
        `ユーザープロファイルの取得に失敗しました: ${allProfilesError.message}`,
      );
    }

    // 全てのユーザーに対して達成回数を設定（未達成の場合は0）
    const allUserCounts = new Map<string, number>();
    for (const profile of allProfiles || []) {
      allUserCounts.set(profile.id, userCounts.get(profile.id) || 0);
    }

    // 達成回数でソート
    const sortedUserIds = Array.from(allUserCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([userId]) => userId);

    if (sortedUserIds.length === 0) {
      return [];
    }

    // プロファイル情報をマップに変換
    const profileMap = new Map(
      (allProfiles || []).map((profile) => [profile.id, profile]),
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
        user_achievement_count: allUserCounts.get(userId) ?? 0,
      } as UserMissionRanking;
    });
  } catch (error) {
    console.error("Mission ranking service error:", error);
    throw error;
  }
}
