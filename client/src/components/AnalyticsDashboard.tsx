import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyticsProps {
  analytics: {
    totalTasks: number;
    completedTasks: number;
    tasksStartedToday: number;
    catalystSuccessRate: number;
    averageTimeToStart: number;
    completionRate: number;
  } | undefined;
}

export default function AnalyticsDashboard({ analytics }: AnalyticsProps) {
  if (!analytics) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const initiationRate = analytics.totalTasks > 0 
    ? Math.round(((analytics.totalTasks - (analytics.totalTasks - analytics.tasksStartedToday)) / analytics.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Task Initiation Rate</h3>
          <div className="text-3xl font-bold text-success mb-2">
            {initiationRate}%
          </div>
          <p className="text-sm text-muted-foreground">+15% improvement this week</p>
          <div className="mt-4">
            <Progress value={initiationRate} className="h-2" />
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Catalyst Effectiveness</h3>
          <div className="text-3xl font-bold text-warning mb-2">
            {analytics.catalystSuccessRate}%
          </div>
          <p className="text-sm text-muted-foreground">Users completing AI suggestions</p>
          <div className="mt-4">
            <Progress value={analytics.catalystSuccessRate} className="h-2" />
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">7-Day Completion</h3>
          <div className="text-3xl font-bold text-primary mb-2">
            {analytics.completionRate}%
          </div>
          <p className="text-sm text-muted-foreground">Tasks finished within a week</p>
          <div className="mt-4">
            <Progress value={analytics.completionRate} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Weekly Progress Chart Placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const height = Math.random() * 100 + 20; // Random height for demo
            return (
              <div key={day} className="flex flex-col items-center">
                <div 
                  className="bg-primary rounded-t w-8" 
                  style={{ height: `${height}px` }}
                ></div>
                <span className="text-xs text-muted-foreground mt-2">{day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Catalysts</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Physical setup actions</span>
              <span className="text-sm text-success">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Document creation</span>
              <span className="text-sm text-success">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Timer-based tasks</span>
              <span className="text-sm text-warning">76%</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average time to start</span>
              <span className="text-sm text-primary">{analytics.averageTimeToStart} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total tasks created</span>
              <span className="text-sm text-primary">{analytics.totalTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tasks completed</span>
              <span className="text-sm text-success">{analytics.completedTasks}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
