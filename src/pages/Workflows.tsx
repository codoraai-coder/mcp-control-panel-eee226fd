import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Workflow as WorkflowIcon, Play, Clock, CheckCircle, XCircle, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Workflow, JobStatus } from "@/types/mcp";

// Mock workflows
const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'LinkedIn Blog Pipeline',
    description: 'Generate a blog post and convert to LinkedIn format',
    targetPlatform: 'LinkedIn',
    steps: [
      { id: 's1', order: 1, name: 'Generate Blog', toolName: 'blog_generator', config: {} },
      { id: 's2', order: 2, name: 'Generate Image', toolName: 'image_generator', config: {} },
      { id: 's3', order: 3, name: 'Convert to LinkedIn', toolName: 'linkedin_converter', config: {} },
    ],
    lastRunAt: new Date(Date.now() - 3600000).toISOString(),
    lastRunStatus: 'completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Weekly Newsletter',
    description: 'Compile top content into a newsletter format',
    steps: [
      { id: 's1', order: 1, name: 'Fetch Top Content', toolName: 'content_fetcher', config: {} },
      { id: 's2', order: 2, name: 'Generate Summary', toolName: 'summarizer', config: {} },
      { id: 's3', order: 3, name: 'Format Newsletter', toolName: 'newsletter_formatter', config: {} },
    ],
    lastRunAt: new Date(Date.now() - 86400000).toISOString(),
    lastRunStatus: 'completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Image Generation Pipeline',
    description: 'Generate images based on text prompts',
    steps: [
      { id: 's1', order: 1, name: 'Process Prompt', toolName: 'prompt_processor', config: {} },
      { id: 's2', order: 2, name: 'Generate Image', toolName: 'image_generator', config: {} },
      { id: 's3', order: 3, name: 'Optimize Image', toolName: 'image_optimizer', config: {} },
    ],
    lastRunStatus: 'failed',
    createdAt: new Date().toISOString(),
  },
];

function WorkflowCard({ workflow, onRun }: { workflow: Workflow; onRun: (workflow: Workflow) => void }) {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRunning(true);
    // Simulate MCP trigger
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRun(workflow);
    setRunning(false);
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
                {workflow.targetPlatform && (
                  <span className="text-xs text-muted-foreground">{workflow.targetPlatform}</span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {workflow.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{workflow.steps.length} steps</span>
              {workflow.lastRunAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(workflow.lastRunAt).toLocaleDateString()}
                </span>
              )}
              {workflow.lastRunStatus && (
                <StatusBadge status={workflow.lastRunStatus} />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleRun}
              disabled={running}
              className="gradient-primary text-primary-foreground"
            >
              {running ? (
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
  const handleRun = (workflow: Workflow) => {
    toast.success(`Workflow "${workflow.name}" started`, {
      description: 'MCP is executing the workflow. Check Dashboard for status.',
    });
  };

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
        <Button className="gradient-primary text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {mockWorkflows.map((workflow) => (
          <WorkflowCard 
            key={workflow.id} 
            workflow={workflow} 
            onRun={handleRun}
          />
        ))}
      </div>
    </div>
  );
}
