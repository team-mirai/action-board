import { createServiceClient } from "@/lib/supabase/server";

/**
 * ポスティング活動のポイントを計算する
 */
export async function calculatePostingPoints(
  postingCount: number,
  missionType = "POSTING",
): Promise<number> {
  const supabase = await createServiceClient();

  const { data: setting } = await supabase
    .from("mission_point_settings")
    .select("points_per_unit")
    .eq("mission_type", missionType)
    .single();

  const pointsPerUnit = setting?.points_per_unit || 5; // デフォルト5ポイント
  return postingCount * pointsPerUnit;
}

/**
 * ポイント設定の更新機能（管理者用）
 */
export async function updatePointSetting(
  missionType: string,
  pointsPerUnit: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const { error } = await supabase.from("mission_point_settings").upsert(
    {
      mission_type: missionType,
      points_per_unit: pointsPerUnit,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "mission_type",
    },
  );

  if (error) {
    console.error("Failed to update point setting:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * ポイント設定の取得
 */
export async function getPointSetting(
  missionType: string,
): Promise<number | null> {
  const supabase = await createServiceClient();

  const { data: setting } = await supabase
    .from("mission_point_settings")
    .select("points_per_unit")
    .eq("mission_type", missionType)
    .single();

  return setting?.points_per_unit || null;
}
