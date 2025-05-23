import Activities from "@/components/activities";
import Events from "@/components/events";
import Missions from "@/components/missions";
import Progress from "@/components/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: privateUser } = await supabase
      .from("private_users")
      .select("id")
      .eq("id", user.id)
      .single();
    if (!privateUser) {
      redirect("/settings/profile?new=true");
    }
  }

  return (
    <div className="flex flex-col py-4">
      <div>
        <h1 className="text-center text-lg font-bold">チームみらい</h1>
        <h1 className="text-center text-lg font-bold">アクションボード</h1>
      </div>

      {!user && (
        <div className="flex flex-col items-center gap-2 my-2">
          <Link href="/sign-up">
            <Button size="sm" className="min-w-72">
              チームみらいに参画する
            </Button>
          </Link>
        </div>
      )}

      <div className="mt-4" />

      <Activities />

      <Progress />

      <Missions userId={user?.id} showAchievedMissions={true} />

      <Events />

      <OpenChat />

      <Sns />
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
    <div className="flex flex-col bg-emerald-50 px-5 py-6 gap-2">
      <h2 className="text-lg font-bold">チームみらいの公認オープンチャット</h2>

      <Card className="flex flex-col border-0 gap-2 p-4">
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
    <div className="flex flex-col bg-emerald-50 p-4 gap-2">
      <h2 className="text-lg font-bold">チームみらいのSNS</h2>
      <p>
        「チームみらい」の活動の最新情報を発信しています。ぜひフォロー・登録お願いします。
      </p>

      <div className="flex flex-row justify-center gap-4">
        {snsData.map((sns) => (
          <a key={sns.id} href={sns.link} target="_blank" rel="noreferrer">
            <Avatar>
              <AvatarFallback>{sns.id.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </a>
        ))}
      </div>
    </div>
  );
}
