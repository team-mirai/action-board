import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Mission from "./mission";

export type MissionsProps = {
  userId?: string;
  maxSize?: number;
  showAchievedMissions: boolean;
};

export default async function Missions({
  userId,
  maxSize,
  showAchievedMissions,
}: MissionsProps) {
  const supabase = await createClient();

  // ユーザーが達成したミッションIDのリスト
  let achievedMissionIds: string[] = [];
  // ユーザーの各ミッションに対する達成回数のマップ
  let userAchievementCountMap = new Map<string, number>();

  if (userId) {
    // ユーザーの達成情報を取得
    const { data: achievements } = await supabase
      .from("achievements")
      .select("mission_id")
      .eq("user_id", userId);

    // 達成したミッションIDのリストを作成
    achievedMissionIds =
      achievements?.map((achievement) => achievement.mission_id ?? "") ?? [];

    // 各ミッションの達成回数をカウント
    if (achievements && achievements.length > 0) {
      const missionCounts = achievements.reduce((counts, achievement) => {
        const missionId = achievement.mission_id;
        if (missionId) {
          counts.set(missionId, (counts.get(missionId) || 0) + 1);
        }
        return counts;
      }, new Map<string, number>());

      userAchievementCountMap = missionCounts;
    }
  }

  // すべてのミッションに対する達成人数を取得
  const { data: achievement_count } = await supabase
    .from("mission_achievement_count_view")
    .select("mission_id, achievement_count");
  const achievement_count_map = new Map(
    achievement_count?.map((achievement) => [
      achievement.mission_id,
      achievement.achievement_count,
    ]),
  );

  let query = supabase
    .from("missions")
    .select()
    .order("created_at", { ascending: false });

  if (!showAchievedMissions) {
    query = query.not("id", "in", `("${achievedMissionIds.join('","')}")`);
  }
  const { data: missions } = maxSize ? await query.limit(maxSize) : await query;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            📈 ミッション
          </h2>
          <p className="text-gray-600 font-medium">
            一緒に政治を変える、具体的なアクション
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions && missions.length > 0 ? (
            missions.map((mission) => (
              <Mission
                key={mission.id}
                mission={mission}
                achieved={achievedMissionIds.includes(mission.id)}
                achievementsCount={achievement_count_map.get(mission.id) ?? 0}
                userAchievementCount={
                  userAchievementCountMap.get(mission.id) ?? 0
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                未達成のミッションはありません
              </p>
              <p className="text-gray-400 text-sm mt-2">
                新しいミッションが追加されるまでお待ちください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
