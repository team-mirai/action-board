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
      <div className="flex text-xs text-gray-500 items-center justify-center mt-1">
        達成済み
      </div>
    );
  }

  if (maxAchievementCount !== null) {
    return (
      <div className="flex text-xs text-blue-500 items-center justify-center mt-1">
        {userAchievementCount}/{maxAchievementCount}回達成
      </div>
    );
  }

  return (
    <div className="flex text-xs text-blue-500 items-center justify-center mt-1">
      {userAchievementCount}回達成
    </div>
  );
}
