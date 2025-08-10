import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal");
  const [priority, setPriority] = useState("medium");
  const [showAIProcessing, setShowAIProcessing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      setShowAIProcessing(true);
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: (data) => {
      setShowAIProcessing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("personal");
      setPriority("medium");

      toast({
        title: "Task Created!",
        description: `Task created with AI catalyst: "${data.catalyst.content}"`,
      });
    },
    onError: (error) => {
      setShowAIProcessing(false);
      
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
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Describe your task... (e.g., Write quarterly report, Learn Spanish, Organize garage)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createTaskMutation.isPending}
            className="text-base"
          />
        </div>
        
        <div>
          <Textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={createTaskMutation.isPending}
            className="resize-none"
            rows={2}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Select value={category} onValueChange={setCategory} disabled={createTaskMutation.isPending}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priority} onValueChange={setPriority} disabled={createTaskMutation.isPending}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={createTaskMutation.isPending || !title.trim()}>
            {createTaskMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="ml-2">Create Task</span>
          </Button>
        </div>
      </form>

      {/* AI Processing Indicator */}
      {showAIProcessing && (
        <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg catalyst-glow">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-4 h-4 animate-spin text-warning" />
            <span className="text-warning">
              AI is generating your catalyst<span className="loading-dots"></span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
