import { ActivityTimeline } from "@/components/activity-timeline";
import { Card } from "@/components/ui/card";
import { dateTimeFormatter } from "@/lib/formatter";
import { createClient } from "@/lib/supabase/server";
import { toZonedTime } from "date-fns-tz";

export default async function Activities() {
  const supabase = await createClient();

  const { data: dailyActionSummary } = await supabase
    .from("daily_action_summary")
    .select()
    .order("date", { ascending: false })
    .limit(2);

  // count achievements
  const { count: achievementCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true });

  // count today's achievements
  const timeZone = "Asia/Tokyo";
  const date = toZonedTime(new Date(), timeZone);
  date.setHours(0, 0, 0, 0);

  const { count: todayAchievementCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  // count total registrations
  const { count: totalRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true });

  // count today's registrations
  const { count: todayRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

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
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            📊 チームみらいの活動状況
          </h2>
          <p className="text-gray-600 font-medium">
            みんなの力で、政治を変えていく
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden border-2 border-emerald-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-white to-emerald-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 -mr-16 -mt-16" />
            <div className="relative flex justify-between items-center">
              <div>
                <div className="text-xl font-bold text-gray-700 mb-2">
                  アクション数
                </div>
                <p className="text-sm text-gray-600">みんなで達成した成果</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    {achievementCount || "0"}
                  </span>
                  <span className="text-2xl font-bold text-gray-700">件</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                    今日{" "}
                    <span>
                      {todayAchievementCount && todayAchievementCount > 0
                        ? "+"
                        : ""}
                      {todayAchievementCount || "0"}
                    </span>
                    <span>件</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="relative overflow-hidden border-2 border-emerald-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-white to-emerald-50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-20 -mr-16 -mt-16" />
            <div className="relative flex justify-between items-center">
              <div>
                <div className="text-xl font-bold text-gray-700 mb-2">
                  登録人数
                </div>
                <p className="text-sm text-gray-600">アクションボード参加者</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    {totalRegistrationCount || "0"}
                  </span>
                  <span className="text-2xl font-bold text-gray-700">人</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200">
                    今日{" "}
                    <span>
                      {todayRegistrationCount && todayRegistrationCount > 0
                        ? "+"
                        : ""}
                      {todayRegistrationCount || "0"}
                    </span>
                    <span>人</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-white">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  ⏰ 活動タイムライン
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  リアルタイムで更新される活動記録
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <ActivityTimeline
                timeline={activityTimelines ?? []}
                hasNext={false}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
