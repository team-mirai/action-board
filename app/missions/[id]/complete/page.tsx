import { achieveMissionAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/utils/supabase/server";
type Params = {
  id: string;
};

type Props = {
  params: Params;
};

export default async function MissionPage({ params }: Props) {
  const { id } = params;
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

  return (
    <div className="flex flex-col">
      <h1>おめでとう！</h1>
      <p>ミッション「{mission.title}」が完了しました！</p>
      TODO: シェア機能
    </div>
  );
}
