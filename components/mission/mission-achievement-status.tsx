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
      <div className="flex items-center justify-center mt-2">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border-2 border-gray-300 shadow-sm">
          <span className="text-sm">✓</span>
          達成済み
        </div>
      </div>
    );
  }

  if (maxAchievementCount !== null) {
    const isPartiallyComplete = userAchievementCount > 0;

    return (
      <div className="flex items-center justify-center mt-2">
        <div
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${
            isPartiallyComplete
              ? "bg-blue-100 text-blue-800 border-blue-300"
              : "bg-gray-100 text-gray-600 border-gray-300"
          }`}
        >
          <span className="text-sm">{isPartiallyComplete ? "🔄" : "○"}</span>
          {userAchievementCount}/{maxAchievementCount}回達成
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-2">
      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border-2 border-gray-300 shadow-sm">
        <span className="text-sm">{userAchievementCount > 0 ? "🔄" : "○"}</span>
        {userAchievementCount}回達成
      </div>
    </div>
  );
}
