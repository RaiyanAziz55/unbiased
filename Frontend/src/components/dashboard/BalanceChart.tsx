import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BalanceSegment {
  label: string;
  percentage: number;
  color: string;
}

const balanceData: BalanceSegment[] = [
  { label: "Far Left", percentage: 5, color: "hsl(280, 60%, 50%)" },
  { label: "Left", percentage: 18, color: "hsl(260, 50%, 55%)" },
  { label: "Center-Left", percentage: 22, color: "hsl(220, 50%, 55%)" },
  { label: "Center", percentage: 30, color: "hsl(220, 10%, 50%)" },
  { label: "Center-Right", percentage: 15, color: "hsl(180, 50%, 45%)" },
  { label: "Right", percentage: 8, color: "hsl(170, 55%, 40%)" },
  { label: "Far Right", percentage: 2, color: "hsl(160, 60%, 35%)" },
];

export function BalanceChart() {
  const navigate = useNavigate();

  return (
    <Card className="card-elevated animate-fade-in" style={{ animationDelay: "300ms" }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Content Balance</CardTitle>
          <CardDescription>Distribution of your analyzed content</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/balance")}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          Tune Balance
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Horizontal Bar */}
        <div className="h-8 rounded-lg overflow-hidden flex">
          {balanceData.map((segment, index) => (
            <div
              key={segment.label}
              className="h-full transition-all duration-500 hover:opacity-90"
              style={{
                width: `${segment.percentage}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.label}: ${segment.percentage}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {balanceData.filter((_, i) => i % 2 === 0 || i === 3).map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: segment.color }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{segment.label}</p>
                <p className="text-xs text-muted-foreground">{segment.percentage}%</p>
              </div>
            </div>
          ))}
        </div>

        {/* Target vs Actual */}
        <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target Balance</span>
            <span className="font-medium">50% Left / 50% Right</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="font-medium text-primary">45% Left / 55% Right</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
