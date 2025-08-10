import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Clock, Zap } from "lucide-react";
import StatsCard from "./StatsCard";

interface AnalyticsProps {
  analytics?: {
    totalTasks: number;
    completedTasks: number;
    tasksInProgress: number;
    tasksStartedToday: number;
    catalystSuccessRate: number;
    averageTimeToStart: number;
    completionRate: number;
  };
}

export default function AnalyticsDashboard({ analytics }: AnalyticsProps) {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: !analytics, // Only fetch if not provided as prop
  });

  const defaultData = {
    totalTasks: 0,
    completedTasks: 0,
    tasksInProgress: 0,
    tasksStartedToday: 0,
    catalystSuccessRate: 0,
    averageTimeToStart: 0,
    completionRate: 0,
  };

  const data = analytics || analyticsData || defaultData;

  if (isLoading && !analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tasks"
          value={data.totalTasks}
          subtitle="All time"
          icon={<Target className="w-6 h-6" />}
        />
        <StatsCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          subtitle={`${data.completedTasks} completed`}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <StatsCard
          title="Started Today"
          value={data.tasksStartedToday}
          subtitle="Tasks in progress"
          icon={<Clock className="w-6 h-6" />}
        />
        <StatsCard
          title="Catalyst Success"
          value={`${data.catalystSuccessRate}%`}
          subtitle="AI effectiveness"
          icon={<Zap className="w-6 h-6" />}
        />
      </div>

      <Card className="p-6 sophisticated-border glass-morphism">
        <h3 className="text-lg font-display font-bold mb-4">Productivity Insights</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Average time to start tasks</span>
            <span className="font-medium">{data.averageTimeToStart} minutes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tasks in progress</span>
            <span className="font-medium">{data.tasksInProgress}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">AI catalyst effectiveness</span>
            <span className="font-medium">{data.catalystSuccessRate}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}