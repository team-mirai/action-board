"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dateTimeFormatter } from "@/lib/formatter";
import type React from "react";
import { useEffect, useState } from "react";
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
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // ハイドレーションエラーを回避するために暫定的にフォーマットをuseEffect()に移動している
    setIsClient(true);
    setFormattedDate(dateTimeFormatter(new Date(submission.created_at)));
  }, [submission.created_at]);

  const canCancel = isLatest && userId && submission.user_id === userId;

  return (
    <li className="border p-4 rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          提出日時: {isClient ? formattedDate : "読み込み中..."}
          {isLatest && (
            <Badge variant="outline" className="mx-4">
              最新
            </Badge>
          )}
        </div>
        {canCancel && (
          <Button
            variant="outline"
            size="xs"
            onClick={() => onCancelClick(submission.id)}
          >
            提出をキャンセル
          </Button>
        )}
      </div>
      <div>
        {submission.artifacts.map((artifact) => (
          <div className="mt-2" key={artifact.id}>
            <ArtifactDisplay key={artifact.id} artifact={artifact} />
          </div>
        ))}
      </div>
    </li>
  );
};

export default SubmissionItem;
