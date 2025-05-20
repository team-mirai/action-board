import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dateTimeFormatter } from "@/utils/formatter";
import type { Tables } from "@/utils/types/supabase";
import Link from "next/link";

interface ActivityTimelineProps {
  timeline: Tables<"activity_timeline_view">[];
}

export function ActivityTimeline({ timeline }: ActivityTimelineProps) {
  return (
    <div className="flex flex-col gap-4">
      {timeline.length === 0 && <div>活動履歴がありません</div>}
      {timeline.map((activity, idx) => (
        <div
          key={activity.id || idx}
          className="flex flex-row gap-2 items-center"
        >
          <Link href={`/user/${activity.user_id}`}>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
              <AvatarFallback>アイコン</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <p>
              {activity.address_prefecture}の{activity.name}さんが「
              {activity.title}」を達成しました！
            </p>
            <p className="text-xs text-gray-500">
              {activity.created_at &&
                dateTimeFormatter(new Date(activity.created_at))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
