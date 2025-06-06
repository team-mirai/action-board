import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { getUserRankings } from "@/lib/services/ranking";
import { MapPin, Trophy } from "lucide-react";
import Link from "next/link";

export default async function RankingPage() {
  const rankings = await getUserRankings();

  return (
    <div className="flex flex-col min-h-screen py-4">
      <div className="max-w-4xl mx-auto px-4 w-full">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">
              🏆 ランキング
            </h1>
            <p className="text-sm text-gray-600 mt-1">ユーザーのXPランキング</p>
          </div>

          <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 bg-white">
            <div className="flex flex-col gap-4">
              {rankings.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  ランキングデータがありません
                </div>
              )}
              {rankings.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg">
                    {user.rank}
                  </div>

                  <Link href={`/users/${user.user_id}`}>
                    <UserAvatar
                      userProfile={{
                        name: user.name,
                        avatar_url: null,
                      }}
                      size="lg"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/users/${user.user_id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        {user.name || "名前未設定"}
                      </Link>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{user.address_prefecture || "未設定"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy size={16} />
                        <span>LV.{user.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">
                      {user.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
