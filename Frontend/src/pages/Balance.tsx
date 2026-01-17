import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Target, Info, RefreshCw, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const presets = [
  { name: "Balanced", value: 50, description: "Equal exposure to all perspectives" },
  { name: "Current Lean", value: 35, description: "Match your current consumption pattern" },
  { name: "Challenge Me", value: 65, description: "More content from opposing views" },
];

export default function Balance() {
  const [targetBalance, setTargetBalance] = useState([50]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("Balanced");

  const handlePresetClick = (preset: typeof presets[0]) => {
    setTargetBalance([preset.value]);
    setSelectedPreset(preset.name);
  };

  const handleSliderChange = (value: number[]) => {
    setTargetBalance(value);
    setSelectedPreset(null);
  };

  const getBalanceLabel = (value: number) => {
    if (value < 30) return "Left-Leaning";
    if (value < 45) return "Slightly Left";
    if (value <= 55) return "Balanced";
    if (value < 70) return "Slightly Right";
    return "Right-Leaning";
  };

  return (
    <DashboardLayout
      title="Balance Tuner"
      description="Customize your desired content balance"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Main Tuner Card */}
        <Card className="card-elevated animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Set Your Target Balance</CardTitle>
            </div>
            <CardDescription>
              Choose how you'd like your content to be distributed across the political spectrum
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-3">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={selectedPreset === preset.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="gap-2"
                >
                  {preset.name}
                </Button>
              ))}
            </div>

            {/* Balance Slider */}
            <div className="space-y-6">
              <div className="relative pt-2">
                {/* Spectrum Background */}
                <div className="absolute inset-x-0 top-0 h-2 spectrum-bar rounded-full" />
                
                {/* Slider */}
                <div className="pt-4">
                  <Slider
                    value={targetBalance}
                    onValueChange={handleSliderChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Labels */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">More Left</span>
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    {getBalanceLabel(targetBalance[0])}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {targetBalance[0]}% Right-leaning content
                  </p>
                </div>
                <span className="text-muted-foreground">More Right</span>
              </div>
            </div>

            {/* Visual Balance Representation */}
            <div className="p-6 rounded-xl bg-muted/30 border border-border">
              <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                Target Distribution
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      This shows how your recommended content will be distributed
                      based on your target balance setting.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </h4>

              <div className="flex gap-2 h-12 rounded-xl overflow-hidden">
                <div 
                  className="bg-spectrum-left h-full transition-all duration-300 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${100 - targetBalance[0]}%` }}
                >
                  {100 - targetBalance[0] > 15 && `${100 - targetBalance[0]}%`}
                </div>
                <div 
                  className="bg-spectrum-right h-full transition-all duration-300 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${targetBalance[0]}%` }}
                >
                  {targetBalance[0] > 15 && `${targetBalance[0]}%`}
                </div>
              </div>

              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Left-leaning content</span>
                <span>Right-leaning content</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                Apply Balance
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="card-elevated animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">How Balance Tuning Works</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your balance preference influences the "Opposing Views" recommendations
                  and helps you understand how diverse your media diet is. Setting a
                  balanced target doesn't filter your feed — it provides suggestions to
                  help you explore perspectives you might not normally encounter.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current vs Target */}
        <Card className="card-elevated animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Current vs Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Current Balance</span>
                <Badge variant="outline">45% Left / 55% Right</Badge>
              </div>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                <div className="bg-spectrum-left h-full" style={{ width: "45%" }} />
                <div className="bg-spectrum-right h-full" style={{ width: "55%" }} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Target Balance</span>
                <Badge variant="secondary" className="text-primary">
                  {100 - targetBalance[0]}% Left / {targetBalance[0]}% Right
                </Badge>
              </div>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-spectrum-left h-full transition-all duration-300" 
                  style={{ width: `${100 - targetBalance[0]}%` }} 
                />
                <div 
                  className="bg-spectrum-right h-full transition-all duration-300" 
                  style={{ width: `${targetBalance[0]}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
