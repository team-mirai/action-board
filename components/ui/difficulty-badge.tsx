import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: number;
  showLabel?: boolean;
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  showLabel = true,
  className,
}: DifficultyBadgeProps) {
  const getDifficultyVariant = (difficulty: number) => {
    if (difficulty <= 2) return "secondary";
    if (difficulty <= 4) return "default";
    return "destructive";
  };

  const difficultyLabels = {
    1: "かんたん",
    2: "ふつう",
    3: "むずかしい",
    4: "とてもむずかしい",
    5: "超むずかしい",
  };

  const label =
    difficultyLabels[difficulty as keyof typeof difficultyLabels] || difficulty;

  return (
    <Badge variant={getDifficultyVariant(difficulty)} className={className}>
      {showLabel ? `難易度: ${label}` : label}
    </Badge>
  );
}
