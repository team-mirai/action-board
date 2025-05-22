import type { Tables } from "@/utils/types/supabase";
import Link from "next/link";
import type React from "react";

// mission_artifacts と achievements を結合したような型を想定
// achievements には user_id, mission_id, created_at があり、
// mission_artifacts には achievement_id, artifact_type, link_url, image_storage_path などがある
// mission_artifact_geolocations も考慮に入れる必要がある

type MissionArtifact = Tables<"mission_artifacts"> & {
  geolocations?: Tables<"mission_artifact_geolocations">[];
};

interface Submission
  extends Omit<Tables<"achievements">, "id" | "mission_id" | "user_id"> {
  id: string; // achievement_id
  mission_id: string;
  user_id: string;
  artifacts: MissionArtifact[];
  created_at: string;
}

interface SubmissionHistoryProps {
  submissions: Submission[];
  missionId: string;
  userId?: string | null;
  maxAchievementCount: number;
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  submissions,
  missionId,
  userId,
  maxAchievementCount,
}) => {
  // 最大達成回数が1より大きいミッションかつ1つ以上の履歴が存在する場合のみ表示
  if (maxAchievementCount <= 1 || submissions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">提出履歴</h2>
      <ul className="space-y-4">
        {submissions.map((submission) => (
          <li key={submission.id} className="border p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-2">
              提出日時: {new Date(submission.created_at).toLocaleString()}
            </p>
            {submission.artifacts.map((artifact) => (
              <div key={artifact.id} className="mb-2">
                {artifact.artifact_type === "IMAGE" ||
                artifact.artifact_type === "IMAGE_WITH_GEOLOCATION" ? (
                  <div className="w-32 h-32 relative mb-2">
                    {artifact.image_storage_path && (
                      <img
                        src={artifact.image_storage_path}
                        alt="提出画像"
                        className="w-32 h-32 object-cover rounded"
                      />
                    )}
                  </div>
                ) : null}
                {artifact.artifact_type === "LINK" && artifact.link_url ? (
                  <Link
                    href={artifact.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {artifact.link_url}
                  </Link>
                ) : null}
                {artifact.artifact_type === "IMAGE_WITH_GEOLOCATION" && (
                  <p className="text-xs text-gray-400">
                    位置情報:{" "}
                    {artifact.geolocations && artifact.geolocations.length > 0
                      ? "あり"
                      : "なし"}
                  </p>
                )}
                {artifact.artifact_type === "IMAGE" && (
                  <p className="text-xs text-gray-400">位置情報: なし</p>
                )}
                {artifact.description && (
                  <p className="text-sm mt-1">{artifact.description}</p>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubmissionHistory;
