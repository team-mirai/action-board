import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { MapPin } from "lucide-react";
import UserDetailActivities from "./user-detail-activities";

export const PAGE_SIZE = 20;

type Params = {
  id: string;
};

type Props = {
  params: Params;
};

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();

  // ユーザー情報取得
  const { data: user } = await supabase
    .from("public_user_profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (!user) return <div>ユーザーが見つかりません</div>;

  // 活動タイムライン取得
  console.log(PAGE_SIZE);
  const { data: timeline } = await supabase
    .from("activity_timeline_view")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const { count } = await supabase
    .from("activity_timeline_view")
    .select("*", { count: "exact" })
    .eq("user_id", id);

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <div className="flex flex-col items-center">
        <Avatar className="w-16 h-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
          <AvatarFallback>アイコン</AvatarFallback>
        </Avatar>
        <div className="text-xl font-bold mt-2">
          {user.x_username || user.name}
        </div>
        <div className="flex items-center gap-1 text-gray-600 mt-1">
          <MapPin size={20} className="mr-1" />
          <span>{user.address_prefecture}</span>
        </div>
      </div>
      <Card className="w-full max-w-xl p-4 mt-4">
        <div className="flex flex-row justify-between items-center mb-2">
          <span className="text-lg font-bold">活動タイムライン</span>
        </div>
        <UserDetailActivities
          initialTimeline={timeline || []}
          pageSize={PAGE_SIZE}
          totalCount={count || 0}
        />
      </Card>
    </div>
  );
}
