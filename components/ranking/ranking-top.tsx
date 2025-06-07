// TOPページ用のランキングコンポーネント
import { Card } from "@/components/ui/card";
import { getRanking } from "@/lib/services/ranking";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { RankingItem } from "./ranking-item";

interface RankingTopProps {
  limit?: number;
}

export default async function RankingTop({ limit = 10 }: RankingTopProps) {
  const rankings = await getRanking(limit);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-2">
            トップ{limit}ランキング
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
          <div className="space-y-4">
            {rankings.map((user) => (
              <RankingItem key={user.user_id} user={user} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
