import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Brain, RotateCcw, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { TaskWithCatalyst } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

interface TaskCardProps {
  task: TaskWithCatalyst;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  isUpdating: boolean;
}

export default function TaskCard({ task, onStatusChange, onDelete, isUpdating }: TaskCardProps) {
  const [catalystCompleted, setCatalystCompleted] = useState(task.catalyst?.completed || false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCatalystMutation = useMutation({
    mutationFn: async ({ catalystId, completed }: { catalystId: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/catalysts/${catalystId}/complete`, { completed });
    },
    onSuccess: (_, { completed }) => {
      setCatalystCompleted(completed);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      
      if (completed) {
        toast({
          title: "Catalyst Completed!",
          description: "The hardest part is behind you. Keep going!",
        });
        
        // Auto-update task to in-progress if not already
        if (task.status === "not_started") {
          setTimeout(() => {
            onStatusChange("in_progress");
          }, 1000);
        }
      }
    },
    onError: (error) => {
      setCatalystCompleted(!catalystCompleted);
      
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
        description: "Failed to update catalyst",
        variant: "destructive",
      });
    },
  });

  const regenerateCatalystMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/catalysts/${task.catalyst?.id}/regenerate`, { taskId: task.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Catalyst Regenerated",
        description: "A new catalyst has been generated for your task!",
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
        description: "Failed to regenerate catalyst",
        variant: "destructive",
      });
    },
  });

  const handleTaskToggle = (checked: boolean) => {
    if (checked) {
      onStatusChange("completed");
    } else {
      onStatusChange(task.status === "not_started" ? "not_started" : "in_progress");
    }
  };

  const handleCatalystToggle = (checked: boolean) => {
    if (task.catalyst) {
      setCatalystCompleted(checked);
      updateCatalystMutation.mutate({
        catalystId: task.catalyst.id,
        completed: checked,
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-900/50 text-red-300";
      case "medium": return "bg-yellow-900/50 text-yellow-300";
      case "low": return "bg-green-900/50 text-green-300";
      default: return "bg-gray-900/50 text-gray-300";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work": return "bg-blue-900/50 text-blue-300";
      case "personal": return "bg-purple-900/50 text-purple-300";
      case "learning": return "bg-indigo-900/50 text-indigo-300";
      case "health": return "bg-emerald-900/50 text-emerald-300";
      default: return "bg-gray-900/50 text-gray-300";
    }
  };

  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress" || catalystCompleted;

  return (
    <Card className={`p-6 slide-in ${isCompleted ? "opacity-75" : ""}`}>
      {/* Main Task */}
      <div className="flex items-start space-x-4">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleTaskToggle}
          disabled={isUpdating}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`font-medium ${isCompleted ? "task-complete" : ""}`}>
              {task.title}
            </h3>
            <Badge className={getCategoryColor(task.category)}>
              {task.category}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority} priority
            </Badge>
            {isCompleted && (
              <Badge className="bg-green-900/50 text-green-300">
                ✓ Completed
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {task.description}
            </p>
          )}
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
            <Brain className="w-3 h-3" />
            <span>
              Status: {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Not Started"}
              {isInProgress && !isCompleted && " - Your brain is actively working on this!"}
            </span>
          </div>

          {/* Completion Celebration */}
          {isCompleted && (
            <div className="flex items-center space-x-2 text-sm text-success">
              <span>🎉</span>
              <span>Great! You've completed this task. The Zeigarnik Effect helped you finish!</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Catalyst */}
      {task.catalyst && !isCompleted && (
        <div className="ml-9 mt-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg catalyst-glow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">AI Catalyst</span>
            </div>
            <Checkbox
              checked={catalystCompleted}
              onCheckedChange={handleCatalystToggle}
              disabled={updateCatalystMutation.isPending}
              className="border-warning data-[state=checked]:bg-warning"
            />
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {task.catalyst.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>⏱️ {task.catalyst.estimatedMinutes} minutes</span>
              <span>✨ Complete to unlock main task</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => regenerateCatalystMutation.mutate()}
              disabled={regenerateCatalystMutation.isPending}
              className="text-xs text-warning hover:text-warning/80"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
