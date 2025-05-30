"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { MissionIcon } from "@/components/ui/mission-icon";
import { dateFormatter } from "@/lib/formatter";
import type { Tables } from "@/lib/types/supabase";

type MissionDetailsProps = {
  mission: Tables<"missions">;
};

export function MissionDetails({ mission }: MissionDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          {mission.icon_url && (
            <MissionIcon src={mission.icon_url} alt={mission.title} size="lg" />
          )}
          <div className="flex-1 space-y-2">
            <CardTitle className="text-xl">{mission.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <DifficultyBadge difficulty={mission.difficulty} />
              {mission.event_date && (
                <Badge variant="outline">
                  {dateFormatter(new Date(mission.event_date))}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
          ref={(el) => {
            if (el && mission.content) {
              el.innerHTML = mission.content;
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
