import { createClient } from "@/utils/supabase/server";
import { ShareButton } from "./ShareButton";
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
      {/* navigator.share()を使っているのモバイルのみ表示 */}
      <ShareButton
        className="mt-2 md:hidden"
        message={shareMessage}
        missionId={id}
      >
        その他のサービスにシェア
      </ShareButton>
    </div>
  );
}
