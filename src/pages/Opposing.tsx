import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PoliticalSpectrum } from "@/components/spectrum/PoliticalSpectrum";
import { 
  Sparkles, 
  ExternalLink, 
  BookmarkPlus, 
  RefreshCw,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  title: string;
  source: string;
  platform: string;
  score: number;
  label: string;
  confidence: number;
  reason: string;
  url: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    title: "A Conservative Perspective on Climate Action",
    source: "@conservativevoice",
    platform: "twitter",
    score: 45,
    label: "Center-Right",
    confidence: 0.78,
    reason: "Balances your recent left-leaning climate content",
    url: "#",
  },
  {
    id: "2",
    title: "Economic Policy: Views from the Center",
    source: "@centristeconomics",
    platform: "instagram",
    score: 5,
    label: "Center",
    confidence: 0.85,
    reason: "Offers middle-ground analysis you haven't explored",
    url: "#",
  },
  {
    id: "3",
    title: "Immigration Reform: A Right-Leaning Analysis",
    source: "@policyreview",
    platform: "facebook",
    score: 55,
    label: "Right",
    confidence: 0.72,
    reason: "Counterbalances progressive immigration content",
    url: "#",
  },
];

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  return (
    <Card 
      className="card-elevated animate-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium line-clamp-2 mb-1">{rec.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{rec.source}</span>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">
                {rec.platform}
              </Badge>
            </div>
          </div>
        </div>

        <PoliticalSpectrum
          score={rec.score}
          label={rec.label}
          confidence={rec.confidence}
          size="sm"
        />

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {rec.reason}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1 gap-2">
            <BookmarkPlus className="h-4 w-4" />
            Save
          </Button>
          <Button size="sm" className="flex-1 gap-2">
            <ExternalLink className="h-4 w-4" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Opposing() {
  return (
    <DashboardLayout
      title="Opposing Views"
      description="Discover perspectives outside your usual media diet"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="card-elevated animate-fade-in border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Personalized for Your Balance</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Based on your content history showing a slight left-lean, we've curated
                  perspectives that could broaden your understanding without overwhelming you.
                </p>
              </div>
              <Button variant="outline" className="gap-2 shrink-0">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Your Balance Context */}
        <Card className="card-elevated animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Your Current Media Profile</CardTitle>
            <CardDescription>
              Recommendations are based on what's missing from your usual consumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your typical content leans:</p>
                  <PoliticalSpectrum
                    score={-22}
                    label="Center-Left"
                    confidence={0.74}
                    size="md"
                    showLabels={false}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden sm:block" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">We're recommending content from:</p>
                  <PoliticalSpectrum
                    score={35}
                    label="Center-Right"
                    confidence={0.80}
                    size="md"
                    showLabels={false}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRecommendations.map((rec, index) => (
              <RecommendationCard key={rec.id} rec={rec} index={index} />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="card-elevated animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Note:</strong> These recommendations aim to expose you to diverse viewpoints, 
              not to change your beliefs. Engaging with different perspectives helps build a more 
              complete understanding of complex issues. All content is algorithmically selected 
              based on language patterns—not editorial endorsement.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
