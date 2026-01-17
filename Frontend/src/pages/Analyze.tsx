import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoliticalSpectrum, SpectrumLegend } from "@/components/spectrum/PoliticalSpectrum";
import { ConfidenceBadge } from "@/components/spectrum/ConfidenceBadge";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Link as LinkIcon, 
  FileText, 
  Loader2, 
  AlertCircle,
  Lightbulb,
  Tag,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  score: number;
  label: string;
  confidence: number;
  themes: string[];
  entities: string[];
  claimsVsOpinions: { claims: number; opinions: number };
  explanation: string;
}

const mockResult: AnalysisResult = {
  score: -28,
  label: "Center-Left",
  confidence: 0.78,
  themes: ["Climate Policy", "Economic Reform", "Social Justice"],
  entities: ["Congress", "EPA", "Green New Deal"],
  claimsVsOpinions: { claims: 60, opinions: 40 },
  explanation:
    "This content emphasizes environmental urgency and government intervention, using language patterns typically associated with progressive policy positions. The rhetoric focuses on collective action and regulatory solutions.",
};

export default function Analyze() {
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResult(mockResult);
    setIsAnalyzing(false);
  };

  return (
    <DashboardLayout
      title="Analyze Post"
      description="Analyze the political leaning of any social media post"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Input Card */}
        <Card className="card-elevated animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Analyze Content
            </CardTitle>
            <CardDescription>
              Paste a URL or the text content from any social media post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputType} onValueChange={(v) => setInputType(v as "url" | "text")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Paste Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="mt-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="https://twitter.com/... or https://instagram.com/..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !inputValue.trim()}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-4 space-y-3">
                <Textarea
                  placeholder="Paste the post content here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  rows={5}
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing || !inputValue.trim()}
                  className="w-full gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-accent">
              <AlertCircle className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-accent-foreground">
                Supported platforms: Twitter/X, Instagram, TikTok, Facebook. 
                If URL scraping fails, you can paste the content directly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        {result && (
          <Card className="card-elevated animate-scale-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription className="mt-1">
                    Political leaning assessment of the analyzed content
                  </CardDescription>
                </div>
                <ConfidenceBadge confidence={result.confidence} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Spectrum */}
              <div className="p-6 rounded-xl bg-muted/30 border border-border">
                <PoliticalSpectrum
                  score={result.score}
                  label={result.label}
                  confidence={result.confidence}
                  size="lg"
                />
                <div className="mt-4 flex justify-center">
                  <SpectrumLegend />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Themes */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Key Themes</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.themes.map((theme) => (
                      <Badge key={theme} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Entities */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">Entities Mentioned</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.entities.map((entity) => (
                      <Badge key={entity} variant="outline">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Claims vs Opinions */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-medium text-sm mb-3">Claims vs Opinions</h4>
                <div className="flex gap-2 h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-l-full transition-all" 
                    style={{ width: `${result.claimsVsOpinions.claims}%` }}
                  />
                  <div 
                    className="bg-muted-foreground/30 h-full rounded-r-full transition-all" 
                    style={{ width: `${result.claimsVsOpinions.opinions}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Factual Claims ({result.claimsVsOpinions.claims}%)</span>
                  <span>Opinion ({result.claimsVsOpinions.opinions}%)</span>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Why This Rating</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> This is an assistive analysis based on language
                  patterns and should not be treated as objective fact. The rating reflects
                  the content's rhetorical positioning, not the political identity of its author.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
