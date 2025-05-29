import { cn } from "@/lib/utils/utils";

interface MissionIconProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-20 h-20",
  lg: "w-24 h-24",
};

export function MissionIcon({
  src,
  alt,
  size = "md",
  className,
}: MissionIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "object-cover rounded-full border shadow-sm",
        sizeClasses[size],
        className,
      )}
    />
  );
}
