import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/utils/types/supabase";
import clsx from "clsx";
import Link from "next/link";

interface MissionProps {
  mission: Tables<"missions">;
  achieved: boolean;
  achievementsCount?: number;
  userAchievementCount?: number;
}

export default function Mission({
  mission,
  achieved,
  achievementsCount,
  userAchievementCount = 0,
}: MissionProps) {
  // 最大達成回数が設定されている場合、ユーザーの達成回数が最大に達しているかどうかを確認
  const hasReachedMaxAchievements =
    mission.max_achievement_count !== null &&
    userAchievementCount >= (mission.max_achievement_count || 0);

  // 達成済みとして表示する条件：
  // 1. 最大達成回数が設定されている場合は、ユーザーの達成回数が最大に達している
  // 2. 最大達成回数が設定されていない場合は、1回でも達成していれば達成済み
  const displayAsAchieved =
    mission.max_achievement_count !== null
      ? hasReachedMaxAchievements
      : achieved;
  const iconUrl = mission.icon_url ?? "/img/mission_fallback_icon.png";

  // 日付の整形
  const eventDate = mission.event_date ? new Date(mission.event_date) : null;
  const dateStr = eventDate
    ? `${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${["日", "月", "火", "水", "木", "金", "土"][eventDate.getDay()]}）開催`
    : null;

  return (
    <Card
      className={clsx(
        "border border-[#C7F5EF] rounded-xl p-4 w-[320px] mx-auto",
        displayAsAchieved && "bg-[#F0F0F0]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-col items-center justify-center">
          <Avatar className="h-14 w-14">
            <AvatarImage src={iconUrl} alt={mission.title} />
            <AvatarFallback>ミッション</AvatarFallback>
          </Avatar>
          {displayAsAchieved && (
            <div className="flex text-xs text-gray-500 items-center justify-center mt-1">
              達成済み
            </div>
          )}
          {achieved &&
            !displayAsAchieved &&
            mission.max_achievement_count !== null && (
              <div className="flex text-xs text-blue-500 items-center justify-center mt-1">
                {userAchievementCount}/{mission.max_achievement_count}回
              </div>
            )}
        </div>
        <div className="flex-1 p-1">
          <div className="text-xs font-bold leading-tight">{mission.title}</div>
          {dateStr && (
            <div className="text-xs text-gray-500 mt-1">{dateStr}</div>
          )}
        </div>
      </div>
      <div className="flex justify-start mt-1">
        <div className="flex items-center gap-4 my-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-700">
              {achievementsCount !== undefined
                ? `${achievementsCount.toLocaleString()}名が達成`
                : "-名が達成"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-700">
              難易度{mission.difficulty}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-1">
        <Link href={`/missions/${mission.id}`} className="w-full">
          <button
            type="button"
            className="w-full bg-[#101828] text-white rounded-lg py-2 text-sm hover:bg-[#1a2533] transition"
          >
            詳細を見る
          </button>
        </Link>
      </div>
    </Card>
  );
}
