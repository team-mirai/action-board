import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTop10Ranking } from "@/lib/services/ranking";
import { ChevronRight, Crown, Medal, Trophy } from "lucide-react";
import Link from "next/link";

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

export default async function Ranking() {
  const rankings = await getTop10Ranking();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-2">
            トップ10ランキング
          </h2>
          <Link
            href="#"
            className="flex items-center text-teal-600 hover:text-teal-700"
          >
            全て見る
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white">
          <div className="space-y-4">
            {rankings.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-4">
                  {getRankIcon(user.rank)}
                  <div>
                    <div className="font-bold text-lg">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      {user.address_prefecture}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
