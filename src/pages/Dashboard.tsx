import { FileText, Workflow, Calendar, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMockData } from "@/hooks/use-api";
import type { JobStatus } from "@/types/mcp";

// Mock running jobs
const runningJobs = [
  { id: '1', workflowName: 'LinkedIn Blog Pipeline', status: 'running' as JobStatus, progress: 65 },
  { id: '2', workflowName: 'Image Generation', status: 'pending' as JobStatus, progress: 0 },
  { id: '3', workflowName: 'Weekly Newsletter', status: 'completed' as JobStatus, progress: 100 },
];

export default function Dashboard() {
  const { stats, recentActivity } = useMockData();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with gradient background */}
      <div className="relative -mx-6 -mt-6 px-6 py-8 mb-6 gradient-hero rounded-b-3xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to MCP Hub - your Master Control Program
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-4 right-24 w-16 h-16 rounded-full bg-accent/10 blur-xl" />
      </div>

      {/* Stats Grid with colorful variants */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Content"
          value={stats.totalContent}
          icon={FileText}
          trend={{ value: 12, direction: 'up' }}
          variant="emerald"
        />
        <StatCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          icon={Workflow}
          description="3 running now"
          variant="teal"
        />
        <StatCard
          title="Scheduled Posts"
          value={stats.scheduledPosts}
          icon={Calendar}
          trend={{ value: 5, direction: 'up' }}
          variant="forest"
        />
        <StatCard
          title="Running Jobs"
          value={stats.runningJobs}
          icon={Loader2}
          description="MCP is working"
          variant="amber"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Status Panel */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Job Status</CardTitle>
            <CardDescription>Real-time MCP workflow execution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border-l-4"
                style={{
                  borderLeftColor: job.status === 'running' 
                    ? 'hsl(173 80% 40%)' 
                    : job.status === 'completed' 
                    ? 'hsl(160 84% 39%)' 
                    : job.status === 'failed' 
                    ? 'hsl(0 72% 51%)' 
                    : 'hsl(145 25% 70%)'
                }}
              >
                <div className="flex items-center gap-3">
                  {job.status === 'running' && (
                    <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  )}
                  {job.status === 'pending' && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  {job.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  {job.status === 'failed' && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-medium text-sm">{job.workflowName}</span>
                </div>
                <div className="flex items-center gap-3">
                  {job.status === 'running' && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full gradient-teal rounded-full transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{job.progress}%</span>
                    </div>
                  )}
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest actions in your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-2.5 w-2.5 mt-1.5 rounded-full bg-primary shrink-0 shadow-glow" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
