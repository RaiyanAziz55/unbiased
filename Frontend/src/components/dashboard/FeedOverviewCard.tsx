import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PoliticalSpectrum, SpectrumLegend } from "@/components/spectrum/PoliticalSpectrum";
import { ConfidenceBadge } from "@/components/spectrum/ConfidenceBadge";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FeedOverviewCardProps {
  overallScore: number;
  overallLabel: string;
  confidence: number;
  postsAnalyzed: number;
  trend: "left" | "right" | "stable";
  trendChange?: number;
}

export function FeedOverviewCard({
  overallScore,
  overallLabel,
  confidence,
  postsAnalyzed,
  trend,
  trendChange = 0,
}: FeedOverviewCardProps) {
  const TrendIcon = trend === "left" ? TrendingDown : trend === "right" ? TrendingUp : Minus;
  const trendColor = trend === "stable" ? "text-muted-foreground" : "text-primary";

  return (
    <Card className="card-elevated animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Your Feed Overview
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    This shows the aggregate political leaning of content you've analyzed.
                    It's an assistive analysis, not a statement of fact.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription className="mt-1">
              Based on {postsAnalyzed} posts analyzed
            </CardDescription>
          </div>
          <ConfidenceBadge confidence={confidence} />
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <PoliticalSpectrum
          score={overallScore}
          label={overallLabel}
          confidence={confidence}
          size="lg"
        />

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <SpectrumLegend />
          
          <div className={cn("flex items-center gap-1.5 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>
              {trend === "stable" ? "Stable" : `${Math.abs(trendChange)} pts ${trend}`}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> This analysis is designed to help you understand potential
            biases in your media diet. It reflects algorithmic estimation based on language patterns
            and should not be treated as objective fact.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
