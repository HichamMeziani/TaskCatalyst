import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, LogOut, User, Flame, TrendingUp, Trophy, Users, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import StatsCard from "@/components/StatsCard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import type { TaskWithCatalyst, ActivityFeed } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tasks");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    enabled: !!user,
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: !!user,
  });

  // Fetch activity feed
  const { data: activityFeed = [] } = useQuery<ActivityFeed[]>({
    queryKey: ["/api/activity-feed"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Task mutations
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity-feed"] });
      toast({
        title: "Task Updated",
        description: "Task status updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const renderProductivityScore = () => {
    const score = (user as any)?.productivityScore || 100;
    const streak = (user as any)?.productivityStreak || 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let color = "text-red-500";
    if (score > 30) color = "text-yellow-500";
    if (score > 70) color = "text-green-500";

    return (
      <Card className="p-6 sophisticated-border glass-morphism">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold">Productivity Score</h3>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            {streak} day streak
          </Badge>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${color} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-display font-bold ${color}`}>
                  {score}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {score < 50 ? "Your score is at risk! Complete tasks to boost it." : "Great job! Keep up the momentum."}
          </p>
        </div>
      </Card>
    );
  };

  const renderActivityFeed = () => {
    return (
      <Card className="p-6 sophisticated-border glass-morphism">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Community Activity
          </h3>
          <Badge variant="outline">Live</Badge>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activityFeed.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent activity. Be the first to complete a task!
            </p>
          ) : (
            activityFeed.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border sophisticated-border"
              >
                <div className="w-8 h-8 premium-gradient rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.activityType === "task_completed" ? (
                    <Target className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Trophy className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">
                      {activity.username || "Someone"}
                    </span>{" "}
                    {activity.description}
                  </p>
                  {activity.taskTitle && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      "{activity.taskTitle}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b sophisticated-border glass-morphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-primary-foreground floating-animation" />
              </div>
              <a href="/" className="text-2xl font-display font-bold gradient-text text-shadow hover:opacity-80 transition-opacity">
                TaskCatalyst
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(user as any)?.firstName || (user as any)?.email}
                </span>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {renderProductivityScore()}
            {renderActivityFeed()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full sophisticated-border">
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    title="Total Tasks"
                    value={analytics?.totalTasks || 0}
                    description="Tasks created"
                  />
                  <StatsCard
                    title="Completed"
                    value={analytics?.completedTasks || 0}
                    description={`${analytics?.completionRate || 0}% completion rate`}
                  />
                  <StatsCard
                    title="In Progress"
                    value={analytics?.tasksInProgress || 0}
                    description="Active tasks"
                  />
                </div>

                <Card className="p-6 sophisticated-border glass-morphism">
                  <h3 className="text-lg font-display font-bold mb-4">Create New Task</h3>
                  <TaskForm />
                </Card>

                <Card className="p-6 sophisticated-border glass-morphism">
                  <h3 className="text-lg font-display font-bold mb-4">Your Tasks</h3>
                  {tasksLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted/20 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No tasks yet. Create your first task to get started!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map((task: TaskWithCatalyst) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={(status) =>
                            updateTaskMutation.mutate({ taskId: task.id, status })
                          }
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="settings">
                <Card className="p-6 sophisticated-border glass-morphism">
                  <h3 className="text-lg font-display font-bold mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Interests</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user?.interests?.map((interest) => (
                          <Badge key={interest} variant="secondary">
                            {interest.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Life Goal</label>
                      <p className="text-muted-foreground">{user?.lifeGoal}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Daily Free Time</label>
                      <p className="text-muted-foreground">{user?.dailyFreeTime} hours</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}