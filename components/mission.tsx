import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/utils/types/supabase";
import Link from "next/link";

interface MissionProps {
  mission: Tables<"missions">;
  achievementsCount?: number;
}

export default function Mission({ mission, achievementsCount }: MissionProps) {
  const iconUrl = mission.icon_url ?? "/img/mission_fallback_icon.png";

  // 日付の整形
  const eventDate = mission.event_date ? new Date(mission.event_date) : null;
  const dateStr = eventDate
    ? `${eventDate.getMonth() + 1}月${eventDate.getDate()}日（${["日", "月", "火", "水", "木", "金", "土"][eventDate.getDay()]}）開催`
    : null;

  return (
    <Card className="border border-[#C7F5EF] rounded-xl p-4 w-[320px] mx-auto">
      <div className="flex items-start gap-3">
        <Avatar className="h-14 w-14">
          <AvatarImage src={iconUrl} alt={mission.title} />
          <AvatarFallback>ミッション</AvatarFallback>
        </Avatar>
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
