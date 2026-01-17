import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

export default function PlaceholderPage({ 
  title, 
  description,
  icon: Icon = Construction 
}: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <DashboardLayout title={title} description={description}>
      <div className="max-w-2xl mx-auto">
        <Card className="card-elevated animate-fade-in">
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Icon className="h-10 w-10 text-primary" />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {description} This feature is currently in development and will be 
              available in a future update.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => navigate("/")}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
