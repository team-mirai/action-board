import { createServiceClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/types/supabase";

export type UserLevel = Tables<"user_levels">;
export type XpTransaction = Tables<"xp_transactions">;
export type XpTransactionInsert = TablesInsert<"xp_transactions">;

/**
 * ユーザーのレベル情報を取得する
 */
export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch user level:", error);
    return null;
  }

  return data;
}

/**
 * ユーザーのレベル情報を初期化する（新規ユーザー用）
 */
export async function initializeUserLevel(
  userId: string,
): Promise<UserLevel | null> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("user_levels")
    .insert({
      user_id: userId,
      xp: 0,
      level: 1,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to initialize user level:", error);
    return null;
  }

  return data;
}

/**
 * ユーザーのレベル情報を取得、存在しない場合は初期化
 */
export async function getOrInitializeUserLevel(
  userId: string,
): Promise<UserLevel | null> {
  let userLevel = await getUserLevel(userId);

  if (!userLevel) {
    userLevel = await initializeUserLevel(userId);
  }

  return userLevel;
}

/**
 * 手動でXPを付与する（ボーナスや調整用）
 */
export async function grantXp(
  userId: string,
  xpAmount: number,
  sourceType: "MISSION_COMPLETION" | "BONUS" | "PENALTY" = "BONUS",
  sourceId?: string,
  description?: string,
): Promise<{ success: boolean; userLevel?: UserLevel; error?: string }> {
  const supabase = await createServiceClient();

  try {
    // トランザクションを使用して整合性を保つ
    const { data: transaction, error: transactionError } = await supabase
      .from("xp_transactions")
      .insert({
        user_id: userId,
        xp_amount: xpAmount,
        source_type: sourceType,
        source_id: sourceId,
        description: description || `${sourceType}による経験値調整`,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Failed to create XP transaction:", transactionError);
      return { success: false, error: transactionError.message };
    }

    // ユーザーレベル情報を更新
    const currentLevel = await getOrInitializeUserLevel(userId);
    if (!currentLevel) {
      return { success: false, error: "Failed to get user level" };
    }

    const newXp = currentLevel.xp + xpAmount;
    const newLevel = calculateLevel(newXp);

    const { data: updatedLevel, error: updateError } = await supabase
      .from("user_levels")
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update user level:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, userLevel: updatedLevel };
  } catch (error) {
    console.error("Error in grantXp:", error);
    return { success: false, error: "Unknown error occurred" };
  }
}

/**
 * ユーザーのXP履歴を取得する
 */
export async function getUserXpHistory(
  userId: string,
  limit = 50,
): Promise<XpTransaction[]> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("xp_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch XP history:", error);
    return [];
  }

  return data || [];
}

/**
 * 特定ユーザーのランクを取得する
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const supabase = await createServiceClient();

  // より高いXPを持つユーザーの数を数える
  const { data: userLevel } = await supabase
    .from("user_levels")
    .select("xp")
    .eq("user_id", userId)
    .single();

  if (!userLevel) return null;

  const { count, error } = await supabase
    .from("user_levels")
    .select("*", { count: "exact", head: true })
    .gt("xp", userLevel.xp);

  if (error) {
    console.error("Failed to calculate user rank:", error);
    return null;
  }

  return (count || 0) + 1; // より高いユーザー数 + 1 = 自分のランク
}

// L → L+1 の差分 XP
export const xpDelta = (L: number) => {
  if (L < 1) throw new Error("Level must be at least 1");
  return 40 + 15 * (L - 1);
};

// レベル L 到達までの累計 XP
export const totalXp = (L: number) => {
  if (L < 1) throw new Error("Level must be at least 1");
  return (L - 1) * (25 + (15 / 2) * L);
};

/**
 * XPに基づくレベル計算
 * 新しい式に基づく逆算
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;

  // 最大レベルを設定（計算の無限ループを防ぐため）
  const maxLevel = 1000;

  for (let level = 1; level <= maxLevel; level++) {
    const requiredXp = totalXp(level + 1);
    if (xp < requiredXp) {
      return level;
    }
  }

  return maxLevel;
}

/**
 * 次のレベルまでに必要なXP計算
 */
export function getXpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevel = currentLevel + 1;
  const nextLevelXp = xpDelta(nextLevel);
  return nextLevelXp - currentXp;
}

/**
 * 現在レベルでの進捗率計算（0-1の値）
 */
export function getLevelProgress(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const currentLevelXp = xpDelta(currentLevel);
  const nextLevelXp = xpDelta(currentLevel + 1);
  const levelXpRange = nextLevelXp - currentLevelXp;
  const progressXp = currentXp - currentLevelXp;
  return Math.max(0, Math.min(1, progressXp / levelXpRange));
}

/**
 * ミッション達成時にXPを付与する
 */
export async function grantMissionCompletionXp(
  userId: string,
  missionId: string,
  achievementId: string,
): Promise<{
  success: boolean;
  userLevel?: UserLevel;
  xpGranted?: number;
  error?: string;
}> {
  const supabase = await createServiceClient();

  try {
    // ミッション情報を取得して難易度を確認
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("difficulty, title")
      .eq("id", missionId)
      .single();

    if (missionError) {
      console.error("Failed to fetch mission:", missionError);
      return { success: false, error: "ミッション情報の取得に失敗しました" };
    }

    // 難易度に基づくXP計算
    const xpToGrant = calculateMissionXp(mission.difficulty);

    // XP履歴を記録
    const { error: transactionError } = await supabase
      .from("xp_transactions")
      .insert({
        user_id: userId,
        xp_amount: xpToGrant,
        source_type: "MISSION_COMPLETION",
        source_id: achievementId,
        description: `ミッション「${mission.title}」達成による経験値獲得`,
      });

    if (transactionError) {
      console.error("Failed to create XP transaction:", transactionError);
      return { success: false, error: "XP履歴の記録に失敗しました" };
    }

    // ユーザーレベル情報を更新
    const currentLevel = await getOrInitializeUserLevel(userId);
    if (!currentLevel) {
      return {
        success: false,
        error: "ユーザーレベル情報の取得に失敗しました",
      };
    }

    const newXp = currentLevel.xp + xpToGrant;
    const newLevel = calculateLevel(newXp);

    const { data: updatedLevel, error: updateError } = await supabase
      .from("user_levels")
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update user level:", updateError);
      return { success: false, error: "ユーザーレベルの更新に失敗しました" };
    }

    return {
      success: true,
      userLevel: updatedLevel,
      xpGranted: xpToGrant,
    };
  } catch (error) {
    console.error("Error in grantMissionCompletionXp:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * ミッションの難易度に基づいてXPを計算する
 */
export function calculateMissionXp(difficulty: number): number {
  switch (difficulty) {
    case 1:
      return 50; // ★1 Easy
    case 2:
      return 100; // ★2 Normal
    case 3:
      return 200; // ★3 Hard
    default:
      return 50; // デフォルト（Easy相当）
  }
}
