import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, Clock, Zap, RotateCcw, Trash2 } from "lucide-react";
import type { TaskWithCatalyst } from "@shared/schema";

interface TaskCardProps {
  task: TaskWithCatalyst;
  onStatusChange: (status: string) => void;
  onDelete?: (taskId: string) => void;
  isUpdating?: boolean;
}

export default function TaskCard({ task, onStatusChange, onDelete, isUpdating = false }: TaskCardProps) {
  const [showCatalyst, setShowCatalyst] = useState(task.status === "not_started");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="p-6 sophisticated-border glass-morphism">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={getStatusColor(task.status || "not_started")}>
                {formatStatus(task.status || "not_started")}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(task.priority || "medium")}>
                {task.priority || "medium"}
              </Badge>
              {task.category && (
                <Badge variant="secondary">
                  {task.category}
                </Badge>
              )}
            </div>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Catalyst */}
        {task.catalyst && (
          <div className="border sophisticated-border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Catalyst</span>
                <Badge variant="outline" className="text-xs">
                  {task.catalyst.estimatedMinutes} min
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCatalyst(!showCatalyst)}
              >
                {showCatalyst ? "Hide" : "Show"}
              </Button>
            </div>
            {showCatalyst && (
              <p className="text-sm text-muted-foreground">
                {task.catalyst.content}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {task.status === "not_started" && (
              <Button
                onClick={() => onStatusChange("in_progress")}
                disabled={isUpdating}
                size="sm"
                className="premium-gradient text-primary-foreground"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Task
              </Button>
            )}
            {task.status === "in_progress" && (
              <Button
                onClick={() => onStatusChange("completed")}
                disabled={isUpdating}
                size="sm"
                className="premium-gradient text-primary-foreground"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
            {task.status === "completed" && (
              <Badge variant="outline" className="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Created {new Date(task.createdAt || Date.now()).toLocaleDateString()}
            {task.completedAt && (
              <span className="block">
                Completed {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}