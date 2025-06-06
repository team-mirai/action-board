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
  const [selectedLevel, setSelectedLevel] = useState<"all" | number>("all");
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayCount = showMore ? 100 : 20;

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

  const filteredRankings =
    selectedLevel === "all"
      ? rankings
      : rankings.filter((user) => user.level >= selectedLevel);

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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">レベル別表示</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedLevel === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel("all")}
                className={
                  selectedLevel === "all" ? "bg-teal-500 hover:bg-teal-600" : ""
                }
              >
                全体
              </Button>
              {[1, 10, 20, 30, 40].map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                  className={
                    selectedLevel === level
                      ? "bg-teal-500 hover:bg-teal-600"
                      : ""
                  }
                >
                  Lv.{level}+
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>次のレベルまで</span>
                <span>2,320pt</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {selectedLevel === "all"
                ? "TOP100ランキング"
                : `レベル${selectedLevel}以上のランキング`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-8">
            {filteredRankings.slice(0, displayCount).map((user) => (
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

            {!showMore && filteredRankings.length > displayCount && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowMore(true)}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                さらに表示 (残り{filteredRankings.length - displayCount}件)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">ランキング統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">
                  {rankings.length}
                </div>
                <div className="text-sm text-gray-600">参加者数</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">
                  {rankings.length > 0
                    ? (
                        rankings.reduce((sum, user) => sum + user.level, 0) /
                        rankings.length
                      ).toFixed(1)
                    : "0"}
                </div>
                <div className="text-sm text-gray-600">平均レベル</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
