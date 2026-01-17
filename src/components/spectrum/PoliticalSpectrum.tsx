import { cn } from "@/lib/utils";

interface PoliticalSpectrumProps {
  score: number; // -100 to +100
  label: string;
  confidence?: number; // 0-1
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spectrumLabels = [
  { position: 0, label: "Far Left" },
  { position: 16.66, label: "Left" },
  { position: 33.33, label: "Center-Left" },
  { position: 50, label: "Center" },
  { position: 66.66, label: "Center-Right" },
  { position: 83.33, label: "Right" },
  { position: 100, label: "Far Right" },
];

export function PoliticalSpectrum({
  score,
  label,
  confidence = 1,
  showLabels = true,
  size = "md",
  className,
}: PoliticalSpectrumProps) {
  // Convert score (-100 to +100) to percentage (0 to 100)
  const position = ((score + 100) / 200) * 100;

  const sizeClasses = {
    sm: { bar: "h-2", indicator: "h-4 w-4 -top-1", label: "text-xs" },
    md: { bar: "h-3", indicator: "h-5 w-5 -top-1", label: "text-sm" },
    lg: { bar: "h-4", indicator: "h-6 w-6 -top-1", label: "text-base" },
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.7) return "ring-confidence-high";
    if (confidence >= 0.4) return "ring-warning";
    return "ring-confidence-low";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Spectrum Bar */}
        <div className={cn("spectrum-bar w-full", sizeClasses[size].bar)} />

        {/* Position Indicator */}
        <div
          className={cn(
            "absolute rounded-full bg-card border-2 border-foreground shadow-lg transition-all duration-500 ring-2",
            sizeClasses[size].indicator,
            getConfidenceColor()
          )}
          style={{
            left: `${position}%`,
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-3 px-1">
          <span className={cn("text-muted-foreground", sizeClasses[size].label)}>
            Left
          </span>
          <span className={cn("font-medium text-foreground", sizeClasses[size].label)}>
            {label}
          </span>
          <span className={cn("text-muted-foreground", sizeClasses[size].label)}>
            Right
          </span>
        </div>
      )}
    </div>
  );
}

export function SpectrumLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-xs text-muted-foreground", className)}>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-confidence-high" />
        <span>High confidence</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-warning" />
        <span>Medium</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-confidence-low" />
        <span>Low</span>
      </div>
    </div>
  );
}
