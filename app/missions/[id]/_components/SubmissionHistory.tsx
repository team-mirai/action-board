"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Tables } from "@/utils/types/supabase";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { cancelSubmissionAction } from "../actions";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");

  // 1つ以上の履歴が存在する場合のみ表示
  if (submissions.length === 0) {
    return null;
  }

  // 提出日時でソートして最新の提出を取得
  const sortedSubmissions = [...submissions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const handleCancelClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSubmissionId) return;

    try {
      const formData = new FormData();
      formData.append("achievementId", selectedSubmissionId);
      formData.append("missionId", missionId);

      const result = await cancelSubmissionAction(formData);

      if (result.success) {
        // 成功時はページをリロードして最新の状態を反映
        window.location.reload();
      } else {
        // エラー時はアラートを表示
        alert(result.error || "キャンセル処理に失敗しました。");
      }
    } catch (error) {
      console.error("キャンセル処理でエラーが発生しました:", error);
      alert("キャンセル処理に失敗しました。もう一度お試しください。");
    } finally {
      setIsDialogOpen(false);
      setSelectedSubmissionId("");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">提出履歴</h2>
      <ul className="space-y-4">
        {sortedSubmissions.map((submission, index) => (
          <li key={submission.id} className="border p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-500">
                提出日時: {new Date(submission.created_at).toLocaleString()}
                {index === 0 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    最新
                  </span>
                )}
              </p>
              {/* 最新の提出についてのみキャンセルボタンを表示 */}
              {index === 0 && userId && submission.user_id === userId && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancelClick(submission.id)}
                    >
                      提出をキャンセル
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>提出をキャンセルしますか？</DialogTitle>
                      <DialogDescription>
                        この操作は取り消すことができません。提出した成果物と関連データがすべて削除されます。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        キャンセル
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelConfirm}
                      >
                        削除する
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
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
