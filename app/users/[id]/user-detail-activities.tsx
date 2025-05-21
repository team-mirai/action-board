"use client";

import { ActivityTimeline } from "@/components/activity-timeline";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/utils/types/supabase";
import { useState } from "react";

interface UserDetailActivitiesProps {
  initialTimeline: Tables<"activity_timeline_view">[];
  totalCount: number;
  pageSize: number;
}

export default function UserDetailActivities(props: UserDetailActivitiesProps) {
  const supabase = createClient();
  const [timeline, setTimeline] = useState<Tables<"activity_timeline_view">[]>(
    props.initialTimeline,
  );
  const [hasNext, setHasNext] = useState(
    props.totalCount > props.initialTimeline.length,
  );
  console.log(hasNext, props.totalCount, props.initialTimeline.length);

  const handleLoadMore = async () => {
    const { data: takeTimeline } = await supabase
      .from("activity_timeline_view")
      .select("*")
      .order("created_at", { ascending: false })
      .range(timeline.length, timeline.length + props.pageSize);
    if (takeTimeline) {
      const newTimeline = [...timeline, ...takeTimeline];
      setTimeline(newTimeline);
      setHasNext(newTimeline.length < props.totalCount);
    }
  };

  return (
    <div>
      <ActivityTimeline
        timeline={timeline || []}
        hasNext={hasNext}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
