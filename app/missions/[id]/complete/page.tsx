import { createClient } from "@/utils/supabase/server";
import { ShareButton } from "./ShareButton";
import { ShareFacebookButton } from "./ShareFacebookButton";
import { ShareLineButton } from "./ShareLineButton";
import { ShareTwitterButton } from "./ShareTwitterButton";

type Params = {
  id: string;
};

type Props = {
  params: Params;
};

export default async function MissionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: mission, error } = await supabase
    .from("missions")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (!mission) {
    throw new Error("Mission not found");
  }

  const message = `ミッション「${mission.title}」が完了しました！`;
  const shareMessage = `チームみらい Action Board で${message}\n`;

  return (
    <div className="flex flex-col">
      <h1>おめでとう！</h1>
      <p>{message}</p>
      <ShareTwitterButton
        className="mt-4"
        message={shareMessage}
        missionId={id}
      >
        Xでシェア
      </ShareTwitterButton>
      <ShareFacebookButton className="mt-4" missionId={id}>
        Facebookでシェア
      </ShareFacebookButton>
      {/* 内部で判定しておりモバイルのみ表示 */}
      <ShareLineButton className="mt-4 md:hidden" missionId={id}>
        Lineでシェア
      </ShareLineButton>
      {/* navigator.share()を使っているのでモバイルのみ表示 */}
      <ShareButton
        className="mt-4 md:hidden"
        message={shareMessage}
        missionId={id}
      >
        その他のサービスにシェア
      </ShareButton>
    </div>
  );
}
