import { ActivityTimeline } from "@/components/activity-timeline";
import { Card } from "@/components/ui/card";
import { dateTimeFormatter } from "@/utils/formatter";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Activities() {
  const supabase = await createClient();

  const { data: dailyActionSummary } = await supabase
    .from("daily_action_summary")
    .select()
    .order("date", { ascending: false })
    .limit(2);

  const { data: dailyDashboardRegistrationSummary } = await supabase
    .from("daily_dashboard_registration_summary")
    .select()
    .order("date", { ascending: false })
    .limit(1);

  const { data: activityTimelines } = await supabase
    .from("activity_timeline_view")
    .select()
    .order("created_at", { ascending: false })
    .limit(10);

  const currentDate = dailyDashboardRegistrationSummary?.[0]?.date
    ? dateTimeFormatter(new Date(dailyDashboardRegistrationSummary[0].date))
    : "データなし";

  const actionNum = dailyActionSummary?.[0]?.count ?? 0;
  const actionNumDiff =
    dailyActionSummary?.length === 2
      ? dailyActionSummary[0].count - dailyActionSummary[1].count
      : 0;

  return (
    <div className="flex flex-col bg-emerald-50 px-5 py-6 gap-2">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-lg font-bold">これまでのチームみらいの活動</h2>
        <div className="text-xs text-gray-500">{currentDate}更新</div>
      </div>

      <Card className="flex justify-between items-center border-0 rounded-lg px-5 py-3">
        <div className="text-lg font-bold">アクション数</div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-emerald-400">
              {actionNumDiff.toLocaleString()}
            </span>
            <span className="text-lg font-bold ml-1">件</span>
          </div>
          <div className="text-sm text-gray-500">
            昨日から + {actionNumDiff}
          </div>
        </div>
      </Card>

      <Card className="flex flex-col border-0 rounded-lg gap-2 px-5 py-6">
        <div className="flex flex-row justify-between">
          <div className="text-lg font-bold">活動タイムライン</div>
          <Link href="/" className="text-sm">
            もっと見る
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <ActivityTimeline
            timeline={activityTimelines ?? []}
            hasNext={false}
          />
        </div>
      </Card>
    </div>
  );
}
