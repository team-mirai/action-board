import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Missions() {
  const supabase = await createClient();

  let { data: missions } = await supabase
    .from("missions")
    .select()
    .order("created_at", { ascending: false });

  missions ??= [];

  return (
    <div className="flex flex-col bg-emerald-50 px-5 py-6 gap-2">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-lg font-bold">ミッション</h2>
        <Link href="/missions" className="text-sm">
          もっと見る
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {missions.map((mission) => (
          <Link key={mission.id} href={`/missions/${mission.id}`}>
            <Card className="flex items-center border-0 gap-2 p-2">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>アイコン</AvatarFallback>
              </Avatar>
              <div className="text-sm">{mission.content}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
