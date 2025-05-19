import { achieveMissionAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";

type Props = {
  params: { id: string };
};

type buttonLabelProps = {
  authUser: User | null;
  achievement: {
    created_at: string;
    id: string;
    mission_id: string | null;
    user_id: string | null;
  } | null;
};
function buttonLabel({ authUser, achievement }: buttonLabelProps) {
  if (authUser === null) {
    return "ログインしてください";
  }

  if (achievement !== null) {
    return "このミッションは完了済みです";
  }

  return "完了する";
}

export default async function MissionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 認証状態に応じてボタンを変化させるため、認証ユーザーを取得
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // ミッション情報を取得
  const { data: mission } = await supabase
    .from("missions")
    .select()
    .eq("id", id)
    .single();

  if (!mission) {
    throw new Error("Mission not found");
  }

  // 達成済みのものは完了ボタンをdisabledにするため、達成状況も取得
  const { data: user } = await supabase
    .from("private_users")
    .select("id")
    .single(); // 認証していない場合にはnullになる可能性がある

  // 達成状況の取得
  let achievement = null;

  if (user?.id) {
    const { data: achievementData } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id)
      .eq("mission_id", mission.id)
      .single();

    achievement = achievementData;
  }

  return (
    <div className="flex flex-col">
      <h1>{mission.title}</h1>
      <p>{mission.content}</p>
      <form className="flex-1 flex flex-col min-w-64">
        <SubmitButton
          pendingText="登録中..."
          formAction={achieveMissionAction}
          disabled={authUser === null || achievement !== null}
        >
          {buttonLabel({ authUser, achievement })}
        </SubmitButton>
      </form>
    </div>
  );
}
