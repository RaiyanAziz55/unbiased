import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeedOverviewCard } from "@/components/dashboard/FeedOverviewCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { MongoChart } from "@/components/charts/MongoChart";

const Index = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Understand your media consumption patterns"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Quick Stats */}
        <QuickStats />

        {/* MongoDB Chart */}
        <MongoChart
          chartId="a3bfd3d7-a708-4350-9fda-394643b0a0be"
          title="Analytics Overview"
          height="400px"
        />

        {/* Feed Overview - Full Width */}
        <FeedOverviewCard
          overallScore={-15}
          overallLabel="Center-Left"
          confidence={0.74}
          postsAnalyzed={47}
          trend="left"
          trendChange={3}
        />

        {/* Recent Analyses */}
        <RecentAnalyses />
      </div>
    </DashboardLayout>
  );
};

export default Index;
