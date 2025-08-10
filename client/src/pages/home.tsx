import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import TaskForm from "@/components/TaskForm";
import TaskCard from "@/components/TaskCard";
import StatsCard from "@/components/StatsCard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import PricingCard from "@/components/PricingCard";
import type { TaskWithCatalyst } from "@shared/schema";
import { Link } from "wouter";

export default function Home() {
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

  // Task mutations
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
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
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Task Deleted",
        description: "Task deleted successfully!",
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
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">TaskCatalyst</span>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-8">
              <button
                className={`pb-4 font-medium transition-colors ${
                  activeTab === "tasks" 
                    ? "text-white border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-white"
                }`}
                onClick={() => setActiveTab("tasks")}
              >
                Tasks
              </button>
              <button
                className={`pb-4 font-medium transition-colors ${
                  activeTab === "analytics" 
                    ? "text-white border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-white"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                Analytics
              </button>
              <Link href="/subscribe">
                <button
                  className={`pb-4 font-medium transition-colors ${
                    activeTab === "upgrade" 
                      ? "text-white border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-white"
                  }`}
                  onClick={() => setActiveTab("upgrade")}
                >
                  Upgrade
                </button>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "tasks" && (
          <>
            {/* Stats Cards */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Tasks Started Today"
                  value={analytics.tasksStartedToday}
                  icon="play-circle"
                  trend="+25% from yesterday"
                  color="success"
                />
                <StatsCard
                  title="Completed"
                  value={analytics.completedTasks}
                  icon="check-circle"
                  trend="3 this hour"
                  color="primary"
                />
                <StatsCard
                  title="Catalyst Success Rate"
                  value={`${analytics.catalystSuccessRate}%`}
                  icon="target"
                  trend="Above average"
                  color="warning"
                />
                <StatsCard
                  title="Completion Rate"
                  value={`${analytics.completionRate}%`}
                  icon="flame"
                  trend="7 days active"
                  color="orange"
                />
              </div>
            )}

            {/* Task Creation */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <TaskForm />
            </Card>

            {/* Task List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Tasks</h2>
              </div>

              {tasksLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No tasks yet. Create your first task above!</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {(tasks as TaskWithCatalyst[]).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(status) => updateTaskMutation.mutate({ taskId: task.id, status })}
                      onDelete={() => deleteTaskMutation.mutate(task.id)}
                      isUpdating={updateTaskMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard analytics={analytics} />
        )}
      </div>
    </div>
  );
}
