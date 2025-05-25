import { createClient, createServiceClient } from "@/lib/supabase/server";

export default async function Progress() {
  const supabase = await createClient();
  const supabaseAdmin = await createServiceClient();

  /*
  const { data: dailyDashboardRegistrationSummary } = await supabase
    .from("daily_dashboard_registration_summary")
    .select()
    .order("date", { ascending: false })
    .limit(1);

  const { data: weeklyEventCountSummary } = await supabase
    .from("weekly_event_count_summary")
    .select()
    .order("date", { ascending: false })
    .limit(1);

  const registrationNum = dailyDashboardRegistrationSummary?.[0]?.count ?? 0;
  const eventNum = weeklyEventCountSummary?.[0]?.count ?? 0;
  */

  // count private_users
  const { count } = await supabaseAdmin
    .from("private_users")
    .select("*", { count: "exact", head: true });

  const registrationNum = count?.toLocaleString() ?? "エラー";

  return (
    <div className="flex flex-col px-5 py-6 gap-2">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-lg font-bold">今日までの活動</h2>
        {/*<div className="text-xs text-gray-500">2025/xx/xx xx:xx更新</div>*/}
      </div>

      <div className="flex flex-row gap-2">
        <p>アクションボード登録人数</p>
        <p>
          {registrationNum}
          <span>人</span>
        </p>
      </div>
      {/*
      <Accordion type="single" collapsible>
        <AccordionItem value="registration">
          <AccordionTrigger>
            <div className="flex flex-row gap-2">
              <p>アクションボード登録人数</p>
              <p>
                {registrationNum}
                <span>人</span>
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>本当はここに日本地図が入る</AccordionContent>
        </AccordionItem>
        */}
      {/*
        <AccordionItem value="event">
          <AccordionTrigger>
            <div className="flex flex-row gap-2">
              <p>イベント開催数</p>
              <p>
                {eventNum}
                <span>回</span>
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>本当はここに日本地図が入る</AccordionContent>
        </AccordionItem>
        */}
    </div>
  );
}
