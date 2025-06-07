import { RankingTop } from "@/components/ranking";
import { CurrentUserCard } from "@/components/ranking/current-user-card";
import { createClient } from "@/lib/supabase/server"; // サーバー用クライアント

export default async function RankingPage() {
  const supabase = await createClient(); // awaitあり

  // ユーザー情報取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let userRanking = null;

  if (user) {
    const { data } = await supabase
      .from("user_ranking_view")
      .select("*")
      .eq("user_id", user.id)
      .single();
    userRanking = data;
  }

  if (user && !userRanking) {
    userRanking = {
      user_id: user.id,
      name: user.user_metadata?.name || "みらいとら",
      address_prefecture: user.user_metadata?.address_prefecture || "東京都",
      updated_at: new Date().toISOString(),
      rank: 100,
      level: 5,
      xp: 12345,
    };
  }

  return (
    <div className="flex flex-col min-h-screen py-4">
      {/* ユーザーのランキングカード */}
      {userRanking && (
        <section className="py-4 md:py-16 bg-white">
          <CurrentUserCard currentUser={userRanking} />
        </section>
      )}

      <section className="py-4 md:py-16 bg-white">
        {/* ランキング */}
        <RankingTop />
      </section>
    </div>
  );
}
