import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ConfidenceBadgeProps {
  confidence: number; // 0-1
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBadge({ confidence, showLabel = true, className }: ConfidenceBadgeProps) {
  const level = confidence >= 0.7 ? "high" : confidence >= 0.4 ? "medium" : "low";
  const percentage = Math.round(confidence * 100);

  const levelConfig = {
    high: {
      label: "High Confidence",
      className: "confidence-badge-high",
    },
    medium: {
      label: "Medium Confidence",
      className: "confidence-badge-medium",
    },
    low: {
      label: "Low Confidence",
      className: "confidence-badge-low",
    },
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        levelConfig[level].className,
        className
      )}
    >
      {percentage}%{showLabel && ` • ${levelConfig[level].label}`}
    </Badge>
  );
}
