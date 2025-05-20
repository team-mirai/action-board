import { ActivityTimeline } from "@/components/activity-timeline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dateTimeFormatter } from "@/utils/formatter";
import { createClient } from "@/utils/supabase/server";
import type { Tables } from "@/utils/types/supabase";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: dailyActionSummary } = await supabase
    .from("daily_action_summary")
    .select()
    .order("date", { ascending: false })
    .limit(2);

  const { data: activityTimelines } = await supabase
    .from("activity_timeline_view")
    .select()
    .order("created_at", { ascending: false })
    .limit(2);

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

  const { data: missions } = await supabase
    .from("missions")
    .select()
    .order("created_at", { ascending: false });

  const { data: events } = await supabase
    .from("events")
    .select()
    .order("created_at", { ascending: false });

  const currentDate = dailyDashboardRegistrationSummary?.[0]?.date
    ? dateTimeFormatter(new Date(dailyDashboardRegistrationSummary[0].date))
    : "データなし";

  const actionNum = dailyActionSummary?.[0]?.count ?? 0;
  const actionNumDiff =
    dailyActionSummary?.length === 2
      ? dailyActionSummary[0].count - dailyActionSummary[1].count
      : 0;

  const registrationNum = dailyDashboardRegistrationSummary?.[0]?.count ?? 0;
  const eventNum = weeklyEventCountSummary?.[0]?.count ?? 0;

  return (
    <div className="flex flex-col">
      <h1 className="text-center p-4">チームみらい</h1>

      <TopSection
        actionNum={actionNum}
        actionNumDiff={actionNumDiff}
        activityTimelines={activityTimelines ?? []}
        currentDate={currentDate}
      />

      <Progress registrationNum={registrationNum} eventNum={eventNum} />

      <Mission missions={missions ?? []} />

      <Event events={events ?? []} />

      <OpenChat />

      <Sns />
    </div>
  );
}

type TopSectionProps = {
  actionNum: number;
  actionNumDiff: number;
  activityTimelines: Tables<"activity_timeline_view">[];
  currentDate: string;
};
function TopSection({
  actionNum,
  actionNumDiff,
  activityTimelines,
  currentDate,
}: TopSectionProps) {
  return (
    <div className="flex flex-col bg-emerald-100 p-4 gap-2">
      <div className="flex flex-row justify-between">
        <h2 className="text-xl font-bold">これまでのチームみらいの活動</h2>
        <p>{currentDate}更新</p>
      </div>

      <Card className="p-2">
        <p>
          <span>{actionNum}</span>アクション
        </p>
        <p>
          昨日から{actionNumDiff > 0 ? "+" : ""}
          {actionNumDiff.toLocaleString()}
        </p>
      </Card>

      <Card className="flex flex-col gap-2 p-4">
        <div className="flex flex-row justify-between">
          <p className="text-lg font-bold">活動タイムライン</p>
          <span>もっと見る</span>
        </div>

        <div className="flex flex-col gap-2">
          <ActivityTimeline timeline={activityTimelines} />
        </div>
      </Card>
    </div>
  );
}

type ProgressProps = {
  registrationNum: number;
  eventNum: number;
};
function Progress({ registrationNum, eventNum }: ProgressProps) {
  return (
    <div className="flex flex-col p-4 gap-2">
      <div className="flex flex-row justify-between">
        <h2 className="text-xl font-bold">今日までの活動</h2>
        <p>2025/xx/xx xx:xx更新</p>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex flex-row gap-2">
              <p>ダッシュボード登録人数</p>
              <p>
                {registrationNum}
                <span>人</span>
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>本当はここに日本地図が入る</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-1">
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
      </Accordion>
    </div>
  );
}

type MissionProps = {
  missions: {
    content: string | null;
    created_at: string;
    icon_url: string | null;
    id: string;
    title: string;
    updated_at: string;
  }[];
};
function Mission({ missions }: MissionProps) {
  return (
    <div className="flex flex-col bg-emerald-100 p-4 gap-2">
      <h2 className="text-xl font-bold">ミッション</h2>

      <div className="flex flex-col gap-2">
        {missions.map((mission) => (
          <Card key={mission.id} className="flex flex-row gap-2 p-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>アイコン</AvatarFallback>
            </Avatar>
            <Link href={`/missions/${mission.id}`}>{mission.content}</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

type EventProps = {
  events: {
    created_at: string;
    id: string;
    starts_at: string;
    title: string;
    updated_at: string;
    url: string;
  }[];
};
function Event({ events }: EventProps) {
  return (
    <div className="flex flex-col p-4 gap-2">
      <h2 className="text-xl font-bold">今後のイベント</h2>

      {events.map((event) => (
        <Card key={event.id} className="flex flex-col p-4">
          <div className="flex flex-col gap-1">
            <p>{dateTimeFormatter(new Date(event.starts_at))}</p>
            <p>{event.title}</p>
            <a href={event.url}>リンク</a>
          </div>
        </Card>
      ))}
    </div>
  );
}

function OpenChat() {
  const chatRoomData = [
    {
      id: 1,
      title: "大学生オプチャ",
      description: "対象:xxxxxの方",
      link: "https://google.com/",
    },
    {
      id: 2,
      title: "xxxxxオプチャ",
      description: "対象:xxxxxの方",
      link: "https://google.com/",
    },
  ];
  return (
    <div className="flex flex-col bg-emerald-100 p-4 gap-2">
      <h2 className="text-xl font-bold">チームみらいの公認オープンチャット</h2>

      <Card className="flex flex-col gap-2 p-4">
        {chatRoomData.map((chatRoom) => (
          <div key={chatRoom.id} className="flex flex-row justify-between">
            <div>
              <p>{chatRoom.title}</p>
              <p>{chatRoom.description}</p>
            </div>
            <Button>
              <a href={chatRoom.link} target="_blank" rel="noreferrer">
                参加
              </a>
            </Button>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Sns() {
  const snsData = [
    {
      id: "LINE",
      icon: "https://github.com/shadcn.png",
      link: "https://google.com",
    },
    {
      id: "Youtube",
      icon: "https://github.com/shadcn.png",
      link: "https://google.com",
    },
    {
      id: "X",
      icon: "https://github.com/shadcn.png",
      link: "https://google.com",
    },
    {
      id: "Instagram",
      icon: "https://github.com/shadcn.png",
      link: "https://google.com",
    },
    {
      id: "Facebook",
      icon: "https://github.com/shadcn.png",
      link: "https://google.com",
    },
  ];

  return (
    <div className="flex flex-col bg-emerald-100 p-4 gap-2">
      <h2 className="text-xl font-bold">チームみらいのSNS</h2>
      <p>
        「チームみらい」の活動の最新情報を発信しています。ぜひフォロー・登録お願いします。
      </p>

      <div className="flex flex-row justify-center gap-4">
        {snsData.map((sns) => (
          <Avatar key={sns.id}>
            <a href={sns.link} target="_blank" rel="noreferrer">
              <AvatarImage src={sns.icon} alt={sns.id} />
            </a>
            <AvatarFallback>アイコン</AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
