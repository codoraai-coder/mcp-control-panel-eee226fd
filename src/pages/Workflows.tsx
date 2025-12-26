import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Workflow as WorkflowIcon, Play, Clock, ChevronRight, Plus, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkflows } from "@/hooks/use-workflows";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { WorkflowListItem } from "@/types/mcp";

function WorkflowCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-3" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowCard({ 
  workflow, 
  onRun,
  isRunning 
}: { 
  workflow: WorkflowListItem; 
  onRun: (id: string) => void;
  isRunning: boolean;
}) {
  const navigate = useNavigate();

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRun(workflow.id);
  };

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/workflows/${workflow.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <WorkflowIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                {workflow.target_platform && (
                  <span className="text-xs text-muted-foreground">{workflow.target_platform}</span>
                )}
              </div>
            </div>
            
            {workflow.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {workflow.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {workflow.last_run_at && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(workflow.last_run_at).toLocaleDateString()}
                </span>
              )}
              {workflow.last_run_status && (
                <StatusBadge status={workflow.last_run_status} />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleRun}
              disabled={isRunning}
              className="gradient-primary text-primary-foreground"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </>
              )}
            </Button>
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Workflows() {
  const { workspaceId } = useWorkspace();
  const { workflows, isLoading, isFetching, error, refetch, runWorkflow, isRunning } = useWorkflows();
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);

  const handleRun = async (workflowId: string) => {
    setRunningWorkflowId(workflowId);
    try {
      await runWorkflow(workflowId);
    } finally {
      setRunningWorkflowId(null);
    }
  };

  // No workspace selected
  if (!workspaceId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Manage and run MCP workflows</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No workspace selected</p>
            <p className="text-sm text-muted-foreground">Create or select a workspace in Settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Manage and run MCP workflows</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">Failed to load workflows</p>
            <p className="text-sm text-muted-foreground mb-4">{(error as Error).message}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Manage and run MCP workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button className="gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Workflows List */}
      {isLoading ? (
        <div className="space-y-4">
          <WorkflowCardSkeleton />
          <WorkflowCardSkeleton />
          <WorkflowCardSkeleton />
        </div>
      ) : workflows.length > 0 ? (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onRun={handleRun}
              isRunning={isRunning && runningWorkflowId === workflow.id}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <WorkflowIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No workflows yet</p>
            <p className="text-sm text-muted-foreground">Create your first workflow to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
