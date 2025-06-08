import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import { totalXp } from "@/lib/utils/utils";

/**
 * レベルアップ通知をチェックし、必要に応じて通知データを返す
 */
export async function checkLevelUpNotification(userId: string): Promise<{
  shouldNotify: boolean;
  levelUp?: {
    previousLevel: number;
    newLevel: number;
    pointsToNextLevel: number;
  };
}> {
  const supabase = await createServiceClient();

  const { data: userLevel, error } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !userLevel) {
    return { shouldNotify: false };
  }

  // 現在のレベルと最後に通知されたレベルを比較
  const currentLevel = userLevel.level;
  const lastNotifiedLevel = userLevel.last_notified_level || 1;

  // レベルが上がっている場合は通知する
  if (currentLevel > lastNotifiedLevel) {
    // 次のレベルまでのポイントを計算
    const nextLevelPoints = totalXp(currentLevel + 1);
    const pointsToNextLevel = nextLevelPoints - userLevel.xp;

    return {
      shouldNotify: true,
      levelUp: {
        previousLevel: lastNotifiedLevel,
        newLevel: currentLevel,
        pointsToNextLevel: Math.max(0, pointsToNextLevel),
      },
    };
  }

  return { shouldNotify: false };
}

/**
 * レベルアップ通知を確認済みとしてマークする
 */
export async function markLevelUpNotificationAsSeen(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  try {
    // 現在のレベルを取得
    const { data: userLevel, error: fetchError } = await supabase
      .from("user_levels")
      .select("level, last_notified_level, xp")
      .eq("user_id", userId)
      .single();

    if (fetchError || !userLevel) {
      console.error("Failed to fetch user level:", fetchError);
      return { success: false, error: "ユーザーレベルの取得に失敗しました" };
    }

    // last_notified_levelを現在のレベルに更新
    const { error: updateError } = await supabase
      .from("user_levels")
      .update({
        last_notified_level: userLevel.level,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update last_notified_level:", updateError);
      return { success: false, error: "通知状態の更新に失敗しました" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markLevelUpNotificationAsSeen:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
