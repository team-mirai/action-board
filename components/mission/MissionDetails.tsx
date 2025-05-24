"use client";

import type { Tables } from "@/lib/utils/types/supabase";

type MissionDetailsProps = {
  mission: Tables<"missions">;
};

export function MissionDetails({ mission }: MissionDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{mission.title}</h1>
      {mission.icon_url && (
        <img
          src={mission.icon_url}
          alt={mission.title}
          className="w-32 h-32 object-cover rounded-full"
        />
      )}
      <p className="text-gray-700 whitespace-pre-wrap">{mission.content}</p>
      <p className="text-sm text-gray-500">難易度: {mission.difficulty}</p>
      {mission.event_date && (
        <p className="text-sm text-gray-500">
          イベント日: {new Date(mission.event_date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
