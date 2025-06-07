import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/lib/types/supabase";
import {
  calculateLevel,
  calculateMissionXp,
  totalXp,
  xpDelta,
} from "../utils/utils";
import { getUser } from "./users";

export type UserLevel = Tables<"user_levels">;
export type XpTransaction = Tables<"xp_transactions">;
export type XpTransactionInsert = TablesInsert<"xp_transactions">;

/**
 * ユーザーのレベル情報を取得する
 */
export async function getMyUserLevel(): Promise<UserLevel | null> {
  const user = await getUser();
  if (!user) {
    console.error("User not found");
    return null;
  }

  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

/**
 * ユーザーのレベル情報を取得する
 */
export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", userId)
    .single();

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
 * XPトランザクションの記録とユーザーレベルの更新を行う共通処理
 */
async function processXpTransaction(
  userId: string,
  xpAmount: number,
  sourceType: "MISSION_COMPLETION" | "BONUS" | "PENALTY",
  sourceId?: string,
  description?: string,
): Promise<{ success: boolean; userLevel?: UserLevel; error?: string }> {
  const supabase = await createServiceClient();

  try {
    // XPトランザクションを記録
    const { error: transactionError } = await supabase
      .from("xp_transactions")
      .insert({
        user_id: userId,
        xp_amount: xpAmount,
        source_type: sourceType,
        source_id: sourceId,
        description: description || `${sourceType}による経験値調整`,
      });

    if (transactionError) {
      console.error("Failed to create XP transaction:", transactionError);
      return { success: false, error: transactionError.message };
    }

    // ユーザーレベル情報を取得・初期化
    const currentLevel = await getOrInitializeUserLevel(userId);
    if (!currentLevel) {
      return {
        success: false,
        error: "ユーザーレベル情報の取得に失敗しました",
      };
    }

    // 新しいXPとレベルを計算
    const newXp = currentLevel.xp + xpAmount;
    const newLevel = calculateLevel(newXp);

    // ユーザーレベルを更新
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

    return { success: true, userLevel: updatedLevel };
  } catch (error) {
    console.error("Error in processXpTransaction:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
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
  return processXpTransaction(
    userId,
    xpAmount,
    sourceType,
    sourceId,
    description,
  );
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

/**
 * 次のレベルまでに必要なXP計算
 */
export function getXpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelTotalXp = totalXp(currentLevel + 1);
  return Math.max(0, nextLevelTotalXp - currentXp);
}

/**
 * 現在レベルでの進捗率計算（0-1の値）
 */
export function getLevelProgress(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const xpToNext = getXpToNextLevel(currentXp);
  const levelXpRange = xpDelta(currentLevel);
  return Math.max(0, Math.min(1, (levelXpRange - xpToNext) / levelXpRange));
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
    const description = `ミッション「${mission.title}」達成による経験値獲得`;

    // 共通のXP処理を実行
    const result = await processXpTransaction(
      userId,
      xpToGrant,
      "MISSION_COMPLETION",
      achievementId,
      description,
    );

    if (result.success) {
      return {
        success: true,
        userLevel: result.userLevel,
        xpGranted: xpToGrant,
      };
    }
    return result;
  } catch (error) {
    console.error("Error in grantMissionCompletionXp:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
