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

  return (
    <div className="flex flex-col min-h-screen py-4 w-full">
      {/* ユーザーのランキングカード */}
      {userRanking && (
        <section className="py-4 md:py-16 bg-white">
          <CurrentUserCard currentUser={userRanking} />
        </section>
      )}

      <section className="py-4 md:py-16 bg-white">
        {/* ランキング */}
        <RankingTop limit={100} />
      </section>
    </div>
  );
}
