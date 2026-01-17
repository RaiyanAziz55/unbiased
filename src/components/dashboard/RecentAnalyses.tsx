import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, ChevronRight } from "lucide-react";
import { PoliticalSpectrum } from "@/components/spectrum/PoliticalSpectrum";
import { ConfidenceBadge } from "@/components/spectrum/ConfidenceBadge";
import { cn } from "@/lib/utils";

interface Analysis {
  id: string;
  source: string;
  title: string;
  score: number;
  label: string;
  confidence: number;
  timestamp: string;
  platform: "twitter" | "instagram" | "tiktok" | "facebook" | "other";
}

const platformColors: Record<Analysis["platform"], string> = {
  twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2]",
  instagram: "bg-[#E4405F]/10 text-[#E4405F]",
  tiktok: "bg-foreground/10 text-foreground",
  facebook: "bg-[#1877F2]/10 text-[#1877F2]",
  other: "bg-muted text-muted-foreground",
};

const mockAnalyses: Analysis[] = [
  {
    id: "1",
    source: "@newsoutlet",
    title: "Climate policy debate heats up as lawmakers...",
    score: -25,
    label: "Center-Left",
    confidence: 0.82,
    timestamp: "2 hours ago",
    platform: "twitter",
  },
  {
    id: "2",
    source: "@politicalcommentator",
    title: "Economic reforms: A balanced look at...",
    score: 5,
    label: "Center",
    confidence: 0.71,
    timestamp: "5 hours ago",
    platform: "instagram",
  },
  {
    id: "3",
    source: "@trendingvoices",
    title: "Immigration policies discussed in new...",
    score: 35,
    label: "Center-Right",
    confidence: 0.65,
    timestamp: "1 day ago",
    platform: "tiktok",
  },
];

function AnalysisItem({ analysis }: { analysis: Analysis }) {
  return (
    <div className="group p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className={cn("text-xs", platformColors[analysis.platform])}>
              {analysis.platform}
            </Badge>
            <span className="text-sm font-medium text-primary">{analysis.source}</span>
          </div>
          
          <p className="text-sm text-foreground line-clamp-1 mb-3">
            {analysis.title}
          </p>

          <PoliticalSpectrum
            score={analysis.score}
            label={analysis.label}
            confidence={analysis.confidence}
            size="sm"
            showLabels={false}
          />
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <ConfidenceBadge confidence={analysis.confidence} showLabel={false} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {analysis.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentAnalyses() {
  return (
    <Card className="card-elevated animate-fade-in" style={{ animationDelay: "200ms" }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Recent Analyses</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockAnalyses.map((analysis) => (
          <AnalysisItem key={analysis.id} analysis={analysis} />
        ))}
      </CardContent>
    </Card>
  );
}
