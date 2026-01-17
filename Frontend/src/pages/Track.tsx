import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PoliticalSpectrum } from "@/components/spectrum/PoliticalSpectrum";
import { ConfidenceBadge } from "@/components/spectrum/ConfidenceBadge";
import { 
  Plus, 
  Search, 
  ExternalLink, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TrackedPage {
  id: string;
  name: string;
  handle: string;
  platform: "twitter" | "instagram" | "tiktok" | "facebook";
  score: number;
  label: string;
  confidence: number;
  postsAnalyzed: number;
  trend: "left" | "right" | "stable";
  avatar?: string;
}

const mockPages: TrackedPage[] = [
  {
    id: "1",
    name: "Daily News Today",
    handle: "@dailynewstoday",
    platform: "twitter",
    score: -35,
    label: "Left",
    confidence: 0.82,
    postsAnalyzed: 24,
    trend: "stable",
  },
  {
    id: "2",
    name: "Political Insider",
    handle: "@politicalinsider",
    platform: "instagram",
    score: 28,
    label: "Center-Right",
    confidence: 0.71,
    postsAnalyzed: 18,
    trend: "right",
  },
  {
    id: "3",
    name: "Centrist Review",
    handle: "@centristrev",
    platform: "twitter",
    score: -5,
    label: "Center",
    confidence: 0.88,
    postsAnalyzed: 31,
    trend: "left",
  },
  {
    id: "4",
    name: "Economic Watch",
    handle: "@econwatch",
    platform: "facebook",
    score: 42,
    label: "Center-Right",
    confidence: 0.65,
    postsAnalyzed: 12,
    trend: "stable",
  },
];

const platformColors: Record<TrackedPage["platform"], string> = {
  twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2]",
  instagram: "bg-[#E4405F]/10 text-[#E4405F]",
  tiktok: "bg-foreground/10 text-foreground",
  facebook: "bg-[#1877F2]/10 text-[#1877F2]",
};

function PageCard({ page }: { page: TrackedPage }) {
  const TrendIcon = page.trend === "left" ? TrendingDown : page.trend === "right" ? TrendingUp : Minus;

  return (
    <Card className="card-elevated hover:shadow-lg transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-semibold">
                {page.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{page.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-muted-foreground">{page.handle}</span>
                <Badge variant="secondary" className={cn("text-xs", platformColors[page.platform])}>
                  {page.platform}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Refresh Analysis</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Stop Tracking</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <PoliticalSpectrum
          score={page.score}
          label={page.label}
          confidence={page.confidence}
          size="sm"
        />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{page.postsAnalyzed} posts</span>
            <div className={cn(
              "flex items-center gap-1",
              page.trend !== "stable" && "text-primary"
            )}>
              <TrendIcon className="h-3 w-3" />
              <span className="capitalize">{page.trend}</span>
            </div>
          </div>
          <ConfidenceBadge confidence={page.confidence} showLabel={false} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Track() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout
      title="Track Pages"
      description="Monitor the political leaning of creators and pages over time"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracked pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Track New Page
          </Button>
        </div>

        {/* Stats Summary */}
        <Card className="card-elevated animate-fade-in">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Tracked</p>
                <p className="text-2xl font-bold mt-1">{mockPages.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posts Analyzed</p>
                <p className="text-2xl font-bold mt-1">
                  {mockPages.reduce((acc, p) => acc + p.postsAnalyzed, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Leaning</p>
                <Badge variant="secondary" className="mt-1">Center-Left</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                <p className="text-2xl font-bold mt-1 text-primary">76%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockPages.map((page, index) => (
            <div 
              key={page.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PageCard page={page} />
            </div>
          ))}
        </div>

        {/* Empty State (hidden when there are pages) */}
        {mockPages.length === 0 && (
          <Card className="card-elevated">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No pages tracked yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking social media pages and creators to understand their
                political leaning over time.
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Track Your First Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
