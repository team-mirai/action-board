import { MissionDetails } from "@/components/mission/MissionDetails";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { MissionFormWrapper } from "./_components/MissionFormWrapper";
import { SubmissionHistoryWrapper } from "./_components/SubmissionHistoryWrapper";
import { getMissionPageData } from "./_lib/data";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MissionPage({ params }: Props) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;
  const pageData = await getMissionPageData(id, user?.id);

  if (!pageData) {
    return <div className="p-4">ミッションが見つかりません。</div>;
  }

  const { mission, userAchievements, submissions, userAchievementCount } =
    pageData;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-screen-md">
      <MissionDetails mission={mission} />

      <MissionFormWrapper
        mission={mission}
        authUser={user}
        userAchievementCount={userAchievementCount}
        userAchievements={userAchievements}
      />

      {submissions.length > 0 && (
        <SubmissionHistoryWrapper
          submissions={submissions}
          missionId={id}
          userId={user?.id}
          maxAchievementCount={mission.max_achievement_count || 0}
        />
      )}
    </div>
  );
}
