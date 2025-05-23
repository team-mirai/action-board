"use client";

import { Button } from "@/components/ui/button";
import type React from "react";
import ArtifactDisplay from "./ArtifactDisplay";
import type { Submission } from "./types";

interface SubmissionItemProps {
  submission: Submission;
  isLatest: boolean;
  userId?: string | null;
  onCancelClick: (submissionId: string) => void;
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({
  submission,
  isLatest,
  userId,
  onCancelClick,
}) => {
  const canCancel = isLatest && userId && submission.user_id === userId;

  return (
    <li className="border p-4 rounded-lg shadow">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-500">
          提出日時: {new Date(submission.created_at).toLocaleString()}
          {isLatest && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              最新
            </span>
          )}
        </p>
        {canCancel && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCancelClick(submission.id)}
          >
            提出をキャンセル
          </Button>
        )}
      </div>
      <div>
        {submission.artifacts.map((artifact) => (
          <ArtifactDisplay key={artifact.id} artifact={artifact} />
        ))}
      </div>
    </li>
  );
};

export default SubmissionItem;
