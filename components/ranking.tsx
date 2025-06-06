import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { type UserRanking, getTop10Ranking } from "@/lib/services/ranking";
import { ChevronRight, Crown, Medal, Trophy } from "lucide-react";
import Link from "next/link";

const RANK_ICONS = {
  1: <Crown className="w-6 h-6 text-yellow-500" />,
  2: <Trophy className="w-6 h-6 text-gray-400" />,
  3: <Medal className="w-6 h-6 text-orange-500" />,
} as const;

const LEVEL_BADGE_COLORS = [
  { threshold: 40, color: "bg-purple-500" },
  { threshold: 30, color: "bg-red-500" },
  { threshold: 20, color: "bg-orange-500" },
  { threshold: 10, color: "bg-teal-500" },
  { threshold: 0, color: "bg-gray-500" },
] as const;

function getRankIcon(rank: number) {
  return (
    RANK_ICONS[rank as keyof typeof RANK_ICONS] || (
      <div className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">
        {rank}
      </div>
    )
  );
}

function getLevelBadgeColor(level: number) {
  return (
    LEVEL_BADGE_COLORS.find((item) => level >= item.threshold)?.color ||
    "bg-gray-500"
  );
}

export default async function Ranking() {
  try {
    const rankings: UserRanking[] = await getTop10Ranking();

    if (!rankings || rankings.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl text-gray-900 mb-2">
                トップ10ランキング
              </h2>
            </div>
            <Card className="border-2 border-gray-200 rounded-2xl shadow-lg p-8 bg-white">
              <div className="text-center py-8">
                <p className="text-gray-500">ランキングデータがありません</p>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-2">
              トップ10ランキング
            </h2>
            <Link
              href="/ranking"
              className="flex items-center text-teal-600 hover:text-teal-700"
            >
              全て見る
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white">
            <ol className="space-y-4" aria-label="ユーザーランキング">
              {rankings.map((user) => (
                <li
                  key={user.user_id}
                  className="flex items-center justify-between py-3 flex-wrap gap-2 sm:gap-4"
                  aria-label={`${user.rank}位 ${user.name}さん レベル${user.level} ${user.xp}ポイント`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {getRankIcon(user.rank)}
                    <div className="min-w-0">
                      <div className="font-bold text-lg truncate">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {user.address_prefecture}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge
                      className={`${getLevelBadgeColor(user.level)} text-white px-3 py-1 rounded-full`}
                    >
                      Lv.{user.level}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {user.xp.toLocaleString()}pt
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("ランキング取得エラー:", error);
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-2">
              トップ10ランキング
            </h2>
          </div>
          <Card className="border-2 border-gray-200 rounded-2xl shadow-lg p-8 bg-white">
            <div className="text-center py-8">
              <p className="text-red-500">ランキングの読み込みに失敗しました</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
