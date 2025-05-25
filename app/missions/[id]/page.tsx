import { MissionDetails } from "@/components/mission/MissionDetails";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { LogIn, Shield } from "lucide-react";
import Link from "next/link";
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
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex flex-col gap-6">
        <MissionDetails mission={mission} />

        {user ? (
          <MissionFormWrapper
            mission={mission}
            authUser={user}
            userAchievementCount={userAchievementCount}
          />
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">
                ログインしてミッションを達成しよう
              </CardTitle>
              <CardDescription>
                ミッションの達成を報告するには、アカウントにログインしてください。
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/sign-in">
                <Button className="w-full sm:w-auto">
                  <LogIn className="mr-2 h-4 w-4" />
                  ログインする
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                アカウントをお持ちでない方は{" "}
                <Link href="/sign-up" className="text-primary hover:underline">
                  こちらから登録
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {submissions.length > 0 && (
          <SubmissionHistoryWrapper
            submissions={submissions}
            missionId={id}
            userId={user?.id}
            maxAchievementCount={mission.max_achievement_count || 0}
          />
        )}
      </div>
    </div>
  );
}
