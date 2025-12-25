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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to MCP Hub - your Master Control Program
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Content"
          value={stats.totalContent}
          icon={FileText}
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          icon={Workflow}
          description="3 running now"
        />
        <StatCard
          title="Scheduled Posts"
          value={stats.scheduledPosts}
          icon={Calendar}
          trend={{ value: 5, direction: 'up' }}
        />
        <StatCard
          title="Running Jobs"
          value={stats.runningJobs}
          icon={Loader2}
          description="MCP is working"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Status Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Status</CardTitle>
            <CardDescription>Real-time MCP workflow execution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {runningJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  {job.status === 'running' && (
                    <Loader2 className="h-4 w-4 text-warning animate-spin" />
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
                    <span className="text-xs text-muted-foreground">{job.progress}%</span>
                  )}
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
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
                <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
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
