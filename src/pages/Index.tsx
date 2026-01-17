import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeedOverviewCard } from "@/components/dashboard/FeedOverviewCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { BalanceChart } from "@/components/dashboard/BalanceChart";

const Index = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Understand your media consumption patterns"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Quick Stats */}
        <QuickStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feed Overview */}
          <FeedOverviewCard
            overallScore={-15}
            overallLabel="Center-Left"
            confidence={0.74}
            postsAnalyzed={47}
            trend="left"
            trendChange={3}
          />

          {/* Balance Chart */}
          <BalanceChart />
        </div>

        {/* Recent Analyses */}
        <RecentAnalyses />
      </div>
    </DashboardLayout>
  );
};

export default Index;
