import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeedOverviewCard } from "@/components/dashboard/FeedOverviewCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { UserPostsGrid } from "@/components/dashboard/UserPostsGrid";
import { MongoChart } from "@/components/charts/MongoChart";

const Index = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Understand your media consumption patterns"
    >
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* MongoDB Chart */}
        <MongoChart
          chartId="a3bfd3d7-a708-4350-9fda-394643b0a0be"
          title="Analytics Overview"
          height="400px"
        />
        {/* User's Analyzed Posts Grid */}
        <UserPostsGrid limit={12} />
      </div>
    </DashboardLayout>
  );
};

export default Index;