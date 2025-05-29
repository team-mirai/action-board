"use client";

import type React from "react";
import CancelSubmissionDialog from "./CancelSubmissionDialog";
import SubmissionItem from "./SubmissionItem";
import type { Submission } from "./types";
import { useSubmissionCancel } from "./useSubmissionCancel";

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
  const {
    isDialogOpen,
    isLoading,
    handleCancelClick,
    handleCancelConfirm,
    handleDialogClose,
  } = useSubmissionCancel(missionId);

  // 1つ以上の履歴が存在する場合のみ表示
  if (submissions.length === 0) {
    return null;
  }

  // 提出日時でソートして最新の提出を取得
  const sortedSubmissions = [...submissions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">あなたの達成履歴</h2>
      <ul className="space-y-4">
        {sortedSubmissions.map((submission, index) => (
          <SubmissionItem
            key={submission.id}
            submission={submission}
            isLatest={index === 0}
            userId={userId}
            onCancelClick={handleCancelClick}
          />
        ))}
      </ul>

      <CancelSubmissionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleCancelConfirm}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SubmissionHistory;
