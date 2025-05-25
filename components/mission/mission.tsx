import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/lib/types/supabase";
import clsx from "clsx";
import Link from "next/link";
import { Button } from "../ui/button";
import MissionAchievementStatus from "./mission-achievement-status";

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

  const iconUrl = mission.icon_url ?? "/img/mission_fallback_icon.png";

  // 日付の整形
  const eventDate = mission.event_date ? new Date(mission.event_date) : null;
  const dateStr = eventDate
    ? `${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${["日", "月", "火", "水", "木", "金", "土"][eventDate.getDay()]}）開催`
    : null;

  // 難易度に応じたバッジカラー
  const difficultyColors = {
    1: "border-green-400 text-green-700",
    2: "border-yellow-400 text-yellow-700",
    3: "border-orange-400 text-orange-700",
    4: "border-red-400 text-red-700",
    5: "border-purple-400 text-purple-700",
  };

  const difficultyLabels = {
    1: "かんたん",
    2: "ふつう",
    3: "むずかしい",
    4: "とてもむずかしい",
    5: "超むずかしい",
  };

  return (
    <Card
      className={clsx(
        "relative overflow-hidden border-2 rounded-2xl p-6 w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        hasReachedMaxAchievements
          ? "bg-gray-50 border-gray-300 opacity-75"
          : "border-gray-200 hover:border-gray-300",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-col items-center justify-center">
          <Avatar
            className={clsx(
              "h-16 w-16 shadow-md transition-all duration-300",
              hasReachedMaxAchievements && "grayscale",
            )}
          >
            <AvatarImage src={iconUrl} alt={mission.title} />
            <AvatarFallback
              className={clsx(
                "font-bold text-white",
                hasReachedMaxAchievements
                  ? "bg-gradient-to-br from-gray-400 to-gray-500"
                  : "bg-gradient-to-br from-emerald-400 to-teal-400",
              )}
            >
              M
            </AvatarFallback>
          </Avatar>
          <MissionAchievementStatus
            hasReachedMaxAchievements={hasReachedMaxAchievements}
            userAchievementCount={userAchievementCount}
            maxAchievementCount={mission.max_achievement_count}
          />
        </div>
        <div className="flex-1">
          <h3
            className={clsx(
              "text-lg font-black leading-tight mb-2",
              hasReachedMaxAchievements ? "text-gray-600" : "text-gray-900",
            )}
          >
            {mission.title}
          </h3>
          {dateStr && (
            <div
              className={clsx(
                "text-sm font-medium",
                hasReachedMaxAchievements ? "text-gray-500" : "text-gray-600",
              )}
            >
              {dateStr}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center align-middle gap-2">
            <span className="text-xl pb-1">👥</span>
            <span
              className={clsx(
                "text-sm font-medium",
                hasReachedMaxAchievements ? "text-gray-500" : "text-gray-700",
              )}
            >
              {achievementsCount !== undefined
                ? `${achievementsCount.toLocaleString()}回達成`
                : "0回達成"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 bg-white",
                difficultyColors[
                  mission.difficulty as keyof typeof difficultyColors
                ] || "border-gray-400 text-gray-700",
              )}
            >
              難易度:{" "}
              {difficultyLabels[
                mission.difficulty as keyof typeof difficultyLabels
              ] || mission.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href={`/missions/${mission.id}`} className="block">
          <Button
            variant="default"
            className={clsx(
              "w-full rounded-full py-6 text-base font-bold text-white shadow-md hover:shadow-lg transform transition-all duration-200",
              hasReachedMaxAchievements
                ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
            )}
          >
            {hasReachedMaxAchievements ? "達成内容を見る →" : "詳細を見る →"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
