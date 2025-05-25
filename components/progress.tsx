import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { toZonedTime } from "date-fns-tz";

export default async function Progress() {
  const supabase = await createClient();

  const timeZone = "Asia/Tokyo";
  const date = toZonedTime(new Date(), timeZone);
  date.setHours(0, 0, 0, 0);

  // count total registrations
  const { count: totalRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true });

  // count today's registrations
  const { count: todayRegistrationCount } = await supabase
    .from("public_user_profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", date.toISOString());

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            📊 今日までの活動
          </h2>
        </div>
        <Card className="relative overflow-hidden border-2 border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-white to-blue-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 -mr-16 -mt-16" />
          <div className="relative flex justify-between items-center">
            <div>
              <div className="text-xl font-bold text-gray-700 mb-2">
                登録人数
              </div>
              <p className="text-sm text-gray-600">アクションボード参加者</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {totalRegistrationCount || "0"}
                </span>
                <span className="text-2xl font-bold text-gray-700">人</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
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
    </div>
  );
}
