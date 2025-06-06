// TOPページ用のランキングコンポーネント
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Trophy } from "lucide-react";

interface RankingUser {
  rank: number;
  user_id: string;
  name: string;
  address_prefecture: string;
  level: number;
  xp: number;
}

interface RankingItemProps {
  user: RankingUser;
  showDetailedInfo?: boolean; // フル版では詳細情報を表示
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Trophy className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-orange-500" />;
    default:
      return (
        <div className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">
          {rank}
        </div>
      );
  }
}

function getLevelBadgeColor(level: number) {
  if (level >= 40) return "bg-purple-500";
  if (level >= 30) return "bg-red-500";
  if (level >= 20) return "bg-orange-500";
  if (level >= 10) return "bg-teal-500";
  return "bg-gray-500";
}

export function RankingItem({
  user,
  showDetailedInfo = false,
}: RankingItemProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        {getRankIcon(user.rank)}
        <div>
          <div className="font-bold text-lg">{user.name}</div>
          <div className="text-sm text-gray-600">{user.address_prefecture}</div>
          {showDetailedInfo && (
            <div className="text-xs text-gray-500 mt-1">ID: {user.user_id}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={`${getLevelBadgeColor(user.level)} text-white px-3 py-1 rounded-full`}
        >
          Lv.{user.level}
        </Badge>
        <div className="text-right">
          <div className="font-bold text-lg">{user.xp.toLocaleString()}pt</div>
        </div>
      </div>
    </div>
  );
}
