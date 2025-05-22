import { createClient } from "@/utils/supabase/server";
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

  let achievedMissionIds: string[] = [];
  if (userId && !showAchievedMissions) {
    const { data: achievements } = await supabase
      .from("achievements")
      .select("mission_id")
      .eq("user_id", userId);
    achievedMissionIds =
      achievements?.map((achievement) => achievement.mission_id ?? "") ?? [];
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

  const query = supabase
    .from("missions")
    .select()
    .order("created_at", { ascending: false });

  const { data: missions } = maxSize ? await query.limit(maxSize) : await query;

  return (
    <div className="flex flex-col bg-emerald-50 px-5 py-6 gap-2">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-lg font-bold">ミッション</h2>
        <Link href="/missions" className="text-sm">
          もっと見る
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {missions && missions.length > 0 ? (
          missions.map((mission) => (
            <Mission
              key={mission.id}
              mission={mission}
              achieved={achievedMissionIds.includes(mission.id)}
              achievementsCount={achievement_count_map.get(mission.id) ?? 0}
            />
          ))
        ) : (
          <div className="text-center text-sm">
            未達成のミッションはありません
          </div>
        )}
      </div>
    </div>
  );
}
