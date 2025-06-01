import { Badge } from "@/components/ui/badge";
import { CheckIcon, CircleDashed } from "lucide-react";

interface MissionAchievementStatusProps {
  hasReachedMaxAchievements: boolean;
  userAchievementCount: number;
  maxAchievementCount: number | null;
}

export default function MissionAchievementStatus({
  hasReachedMaxAchievements,
  userAchievementCount,
  maxAchievementCount,
}: MissionAchievementStatusProps) {
  if (hasReachedMaxAchievements) {
    return (
      <Badge variant="outline" className="text-xxs px-2">
        <CheckIcon size={14} className="mr-1" />
        達成済み
      </Badge>
    );
  }

  if (maxAchievementCount !== null) {
    const isPartiallyComplete = userAchievementCount > 0;

    return (
      <Badge variant="outline" className="text-xxs px-2">
        {isPartiallyComplete ? (
          <CheckIcon size={14} className="mr-1" />
        ) : (
          <CircleDashed size={14} className="mr-1" />
        )}
        {userAchievementCount}/{maxAchievementCount}回達成
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xxs px-2">
      <span>
        {userAchievementCount > 0 ? (
          <CheckIcon size={14} className="mr-1" />
        ) : (
          <CircleDashed size={14} className="mr-1" />
        )}
      </span>
      {userAchievementCount}回達成
    </Badge>
  );
}
