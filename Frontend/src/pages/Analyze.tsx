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
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { analysisApi } from "@/lib/api/analysis";

interface AnalysisResult {
  score: number;
  label: string;
  confidence: number;
  summary: string;
  raw: any;
}

// Parse the classification string to extract score and label
const parseClassification = (classification: string): { score: number; label: string } => {
  const labelToScore: Record<string, number> = {
    'FAR LEFT': -80,
    'LEAN LEFT': -40,
    'LEFT': -40,
    'CENTER LEFT': -20,
    'CENTER-LEFT': -20,
    'CENTER': 0,
    'CENTER RIGHT': 20,
    'CENTER-RIGHT': 20,
    'LEAN RIGHT': 40,
    'RIGHT': 40,
    'FAR RIGHT': 80,
  };

  const upperClass = classification.toUpperCase().replace('# CLASSIFICATION:', '').trim();
  
  for (const [key, score] of Object.entries(labelToScore)) {
    if (upperClass.includes(key)) {
      return { score, label: key.replace(/-/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) };
    }
  }

  return { score: 0, label: 'Center' };
};

export default function Analyze() {
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to analyze content.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Create a new conversation first
      const conversation = await analysisApi.createConversation();
      
      // Analyze the URL
      const response = await analysisApi.analyzeUrl(
        conversation.id,
        user.userId,
        inputValue
      );

      // Parse the response
      const classification = response.stage3?.response || '';
      const { score, label } = parseClassification(classification);

      setResult({
        score,
        label,
        confidence: 0.75, // API doesn't return confidence directly, using default
        summary: classification,
        raw: response,
      });

      toast({
        title: "Analysis Complete",
        description: "Content has been analyzed successfully.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze content. Make sure your backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
              Paste a URL from any social media post to analyze its political leaning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputType} onValueChange={(v) => setInputType(v as "url" | "text")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2" disabled>
                  <FileText className="h-4 w-4" />
                  Paste Text (Coming Soon)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="mt-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="https://instagram.com/reel/... or https://twitter.com/..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                    disabled={isAnalyzing}
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
                  disabled
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-accent">
              <AlertCircle className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-accent-foreground">
                Supported platforms: Instagram, Twitter/X, TikTok. 
                The URL will be scraped and analyzed by our LLM Council.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="card-elevated animate-fade-in">
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <h3 className="font-medium">Analyzing Content</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our LLM Council is reviewing the content...
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Scraping URL
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    Stage 1: Responses
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    Stage 2: Rankings
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    Stage 3: Synthesis
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Card */}
        {result && (
          <Card className="card-elevated animate-scale-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription className="mt-1">
                      Political leaning assessment of the analyzed content
                    </CardDescription>
                  </div>
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

              {/* Summary */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Analysis Summary</h4>
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {result.summary}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Details (Collapsible) */}
              {result.raw && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    View detailed model responses
                  </summary>
                  <div className="mt-4 space-y-4">
                    {result.raw.stage1 && (
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <h5 className="font-medium text-sm mb-2">Stage 1: Individual Model Responses</h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {result.raw.stage1.map((r: any, i: number) => (
                            <div key={i} className="text-xs p-2 bg-background rounded border">
                              <span className="font-medium">{r.model || `Model ${i + 1}`}:</span>
                              <p className="mt-1 text-muted-foreground">{r.response?.substring(0, 200)}...</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}

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
