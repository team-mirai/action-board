"use client";
import { ActivityTimeline } from "@/components/activity-timeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/utils/types/supabase";
import { MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailPage() {
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  const [user, setUser] = useState<Tables<"public_user_profiles"> | null>(null);
  const [timeline, setTimeline] = useState<Tables<"activity_timeline_view">[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      // ユーザー情報取得
      const { data: userData } = await supabase
        .from("public_user_profiles")
        .select("*")
        .eq("id", id)
        .single();
      setUser(userData);
      console.log(id, userData);
      // 活動タイムライン取得
      const { data: timelineData } = await supabase
        .from("activity_timeline_view")
        .select("*")
        .order("created_at", { ascending: false });
      setTimeline(timelineData || []);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div>読み込み中...</div>;
  if (!user) return <div>ユーザーが見つかりません</div>;

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
        <ActivityTimeline timeline={timeline} />
      </Card>
    </div>
  );
}
