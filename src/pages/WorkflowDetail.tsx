import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle, Clock, XCircle, Loader2, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Workflow, Job, JobStatus } from "@/types/mcp";

// Mock workflow detail
const mockWorkflow: Workflow = {
  id: '1',
  name: 'LinkedIn Blog Pipeline',
  description: 'Generate a blog post, create accompanying image, and convert both to LinkedIn-ready format.',
  targetPlatform: 'LinkedIn',
  steps: [
    { id: 's1', order: 1, name: 'Generate Blog Post', toolName: 'blog_generator', config: { topic: 'AI trends', length: 'medium' } },
    { id: 's2', order: 2, name: 'Generate Hero Image', toolName: 'image_generator', config: { style: 'professional' } },
    { id: 's3', order: 3, name: 'Convert to LinkedIn Format', toolName: 'linkedin_converter', config: { includeHashtags: true } },
  ],
  lastRunAt: new Date(Date.now() - 3600000).toISOString(),
  lastRunStatus: 'completed',
  createdAt: new Date().toISOString(),
};

// Mock job with outputs
const mockJob: Job = {
  id: 'job1',
  workflowId: '1',
  status: 'completed',
  progress: 100,
  logs: [
    '[10:30:01] Starting workflow: LinkedIn Blog Pipeline',
    '[10:30:02] Step 1: Generate Blog Post - Started',
    '[10:30:15] Step 1: Generate Blog Post - Completed',
    '[10:30:16] Step 2: Generate Hero Image - Started',
    '[10:30:45] Step 2: Generate Hero Image - Completed',
    '[10:30:46] Step 3: Convert to LinkedIn Format - Started',
    '[10:30:52] Step 3: Convert to LinkedIn Format - Completed',
    '[10:30:52] Workflow completed successfully',
  ],
  outputs: [
    { id: 'c1', type: 'blog', title: 'AI Trends 2025: What to Expect', status: 'approved', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'c2', type: 'image', title: 'AI Trends Hero Image', status: 'approved', thumbnailUrl: '/placeholder.svg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  completedAt: new Date(Date.now() - 3540000).toISOString(),
};

const stepStatusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-5 w-5 text-success" />,
  running: <Loader2 className="h-5 w-5 text-warning animate-spin" />,
  pending: <Clock className="h-5 w-5 text-muted-foreground" />,
  failed: <XCircle className="h-5 w-5 text-destructive" />,
};

export default function WorkflowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState<JobStatus>('completed');
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setJobStatus('pending');
    
    // Simulate job progression
    await new Promise(resolve => setTimeout(resolve, 1000));
    setJobStatus('running');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setJobStatus('completed');
    setRunning(false);
    
    toast.success('Workflow completed successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workflows')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{mockWorkflow.name}</h1>
          <p className="text-muted-foreground">{mockWorkflow.description}</p>
        </div>
        <Button 
          onClick={handleRun}
          disabled={running}
          className="gradient-primary text-primary-foreground"
        >
          {running ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Run Workflow
            </span>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workflow Info & Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Target Platform</p>
                <p className="font-medium">{mockWorkflow.targetPlatform || 'None'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Steps</p>
                <p className="font-medium">{mockWorkflow.steps.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Run</p>
                <p className="font-medium">
                  {mockWorkflow.lastRunAt 
                    ? new Date(mockWorkflow.lastRunAt).toLocaleString() 
                    : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Steps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Steps</CardTitle>
              <CardDescription>Steps are executed in order by MCP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.name}</p>
                      <p className="text-sm text-muted-foreground">Tool: {step.tool_name || step.toolName}</p>
                    </div>
                    {stepStatusIcons[jobStatus === 'completed' ? 'completed' : index === 0 && running ? 'running' : 'pending']}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
                {Array.isArray(mockJob.logs) && mockJob.logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground hover:text-foreground">
                    {String(log)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Job Status & Outputs */}
        <div className="space-y-6">
          {/* Job Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={jobStatus} />
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>{new Date(mockJob.startedAt).toLocaleTimeString()}</span>
                </div>
                {mockJob.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{new Date(mockJob.completedAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outputs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Content</CardTitle>
              <CardDescription>Outputs from this workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockJob.outputs?.map((output) => (
                <div 
                  key={output.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                    {output.type === 'blog' ? (
                      <FileText className="h-4 w-4 text-primary" />
                    ) : (
                      <Image className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{output.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{output.type}</p>
                  </div>
                  <StatusBadge status={output.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
