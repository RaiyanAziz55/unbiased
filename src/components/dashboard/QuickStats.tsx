import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  delay?: number;
}

function StatCard({ title, value, description, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <Card 
      className="card-elevated animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>

        {trend && (
          <div className={cn(
            "mt-3 flex items-center gap-1 text-sm",
            trend.positive ? "text-confidence-high" : "text-destructive"
          )}>
            <TrendingUp className={cn("h-3 w-3", !trend.positive && "rotate-180")} />
            <span>{trend.value}% from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Posts Analyzed"
        value={47}
        description="This month"
        icon={FileText}
        trend={{ value: 12, positive: true }}
        delay={0}
      />
      <StatCard
        title="Pages Tracked"
        value={8}
        description="Active monitoring"
        icon={Users}
        delay={100}
      />
      <StatCard
        title="Balance Score"
        value="72%"
        description="Toward your target"
        icon={Target}
        delay={200}
      />
      <StatCard
        title="Diversity Index"
        value={3.4}
        description="Out of 5"
        icon={TrendingUp}
        trend={{ value: 8, positive: true }}
        delay={300}
      />
    </div>
  );
}
