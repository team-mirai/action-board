import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";

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
  const getDifficultyStyles = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "text-green-800 border-green-500 hover:bg-green-50";
      case 2:
        return "text-blue-800 border-blue-500 hover:bg-blue-50";
      case 3:
        return "text-yellow-800 border-yellow-500 hover:bg-yellow-50";
      case 4:
        return "text-orange-800 border-orange-500 hover:bg-orange-50";
      case 5:
        return "text-red-800 border-red-500 hover:bg-red-50";
      default:
        return "text-gray-800 border-gray-500 hover:bg-gray-50";
    }
  };

  const difficultyLabels = {
    1: "とてもかんたん",
    2: "かんたん",
    3: "ふつう",
    4: "むずかしい",
    5: "とてもむずかしい",
  };

  const label =
    difficultyLabels[difficulty as keyof typeof difficultyLabels] || difficulty;

  return (
    <Badge
      variant="outline"
      className={cn(getDifficultyStyles(difficulty), "border", className)}
    >
      {showLabel ? `難易度: ${label}` : label}
    </Badge>
  );
}
