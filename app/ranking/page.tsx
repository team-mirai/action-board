"use client";

import { RankingItem } from "@/components/ranking/ranking-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import UserAvatar from "@/components/user-avatar";
import {
  type UserRanking,
  getCurrentUserRanking,
  getUserRankings,
} from "@/lib/services/ranking";
import { ChevronDown, User } from "lucide-react";
import { useEffect, useState } from "react";

const getLevelBadgeColor = (level: number) => {
  if (level >= 40) return "bg-purple-500";
  if (level >= 30) return "bg-red-500";
  if (level >= 20) return "bg-orange-500";
  if (level >= 10) return "bg-teal-500";
  return "bg-gray-500";
};

export default function RankingPage() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRanking | null>(null);

  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayCount = showMore ? 100 : 21;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rankingData = await getUserRankings(100);
        setRankings(rankingData);
      } catch (error) {
        console.error("Failed to fetch ranking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">
            🏆 TOP100ランキング
          </h1>
          <Badge variant="secondary" className="bg-teal-50 text-teal-700">
            リアルタイム更新
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="border-teal-200 bg-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              あなたのランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.rank || 156}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {currentUser?.name || "あなた"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentUser?.address_prefecture || "東京都"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={`${getLevelBadgeColor(currentUser?.level || 12)} text-white`}
                  >
                    Lv.{currentUser?.level || 12}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-teal-600">
                  {currentUser?.xp.toLocaleString() || "45,680"}pt
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">TOP100ランキング</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-8">
            {rankings.slice(0, displayCount).map((user) => (
              <RankingItem
                key={user.user_id}
                user={{
                  rank: user.rank,
                  user_id: user.user_id,
                  name: user.name || "名前未設定",
                  address_prefecture: user.address_prefecture || "未設定",
                  level: user.level,
                  xp: user.xp,
                }}
                showDetailedInfo={true}
              />
            ))}

            {!showMore && rankings.length > displayCount && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowMore(true)}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                さらに表示 (残り{rankings.length - displayCount}件)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
