import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostingJobs } from "@/hooks/use-posting-jobs";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { PostingJobCard } from "@/components/posting/PostingJobCard";
import { XPostComposer } from "@/components/posting/XPostComposer";
import { PostingJob, PostingStatus } from "@/types/mcp";
import { RefreshCw, Inbox, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Posting() {
  const { workspaceId } = useWorkspace();
  
  const {
    readyJobs,
    isLoading,
    error,
    refetch,
    useAllJobs,
    markAsPosted,
    markAsFailed,
    retry,
    schedule,
    cancelSchedule,
    isMarkingPosted,
    isMarkingFailed,
    isRetrying,
    isScheduling,
    isCancellingSchedule,
  } = usePostingJobs(workspaceId);

  const [activeTab, setActiveTab] = useState<"ready" | "posted" | "failed">("ready");
  const [selectedJob, setSelectedJob] = useState<PostingJob | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  // Fetch jobs based on active tab
  const postedJobsQuery = useAllJobs("posted" as PostingStatus);
  const failedJobsQuery = useAllJobs("failed" as PostingStatus);

  const postedJobs = postedJobsQuery.data ?? [];
  const failedJobs = failedJobsQuery.data ?? [];

  const isActionLoading = isMarkingPosted || isMarkingFailed || isRetrying || isScheduling || isCancellingSchedule;

  const handleOpenComposer = (job: PostingJob) => {
    setSelectedJob(job);
    setComposerOpen(true);
  };

  const renderEmptyState = (type: "ready" | "posted" | "failed") => {
    const config = {
      ready: {
        icon: <Clock className="h-12 w-12 text-muted-foreground/50" />,
        title: "No posts ready",
        description: "Run a workflow with the post_to_x step to generate posts for X.",
      },
      posted: {
        icon: <CheckCircle className="h-12 w-12 text-muted-foreground/50" />,
        title: "No posted content yet",
        description: "Posts you've successfully shared to X will appear here.",
      },
      failed: {
        icon: <XCircle className="h-12 w-12 text-muted-foreground/50" />,
        title: "No failed posts",
        description: "Posts that couldn't be shared will appear here for retry.",
      },
    };

    const { icon, title, description } = config[type];

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {icon}
        <h3 className="mt-4 font-medium text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      </div>
    );
  };

  const renderJobList = (jobs: PostingJob[], type: "ready" | "posted" | "failed") => {
    if (jobs.length === 0) {
      return renderEmptyState(type);
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((job) => (
          <PostingJobCard
            key={job.id}
            job={job}
            onMarkPosted={markAsPosted}
            onMarkFailed={markAsFailed}
            onRetry={retry}
            onSchedule={schedule}
            onCancelSchedule={cancelSchedule}
            isLoading={isActionLoading}
          />
        ))}
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">X (Twitter) Posting</h1>
          <p className="text-muted-foreground mt-1">
            Manage and publish your content to X
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">Failed to load posting jobs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <Button onClick={() => refetch()}>
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">X (Twitter) Posting</h1>
          <p className="text-muted-foreground mt-1">
            Manage and publish your content to X
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready to Post</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              {isLoading ? <Skeleton className="h-9 w-12" /> : readyJobs.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Posted</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              {postedJobsQuery.isLoading ? <Skeleton className="h-9 w-12" /> : postedJobs.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              {failedJobsQuery.isLoading ? <Skeleton className="h-9 w-12" /> : failedJobs.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ready ({readyJobs.length})
          </TabsTrigger>
          <TabsTrigger value="posted" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Posted ({postedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Failed ({failedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ready" className="mt-6">
          {isLoading ? renderLoadingSkeleton() : renderJobList(readyJobs, "ready")}
        </TabsContent>

        <TabsContent value="posted" className="mt-6">
          {postedJobsQuery.isLoading ? renderLoadingSkeleton() : renderJobList(postedJobs, "posted")}
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          {failedJobsQuery.isLoading ? renderLoadingSkeleton() : renderJobList(failedJobs, "failed")}
        </TabsContent>
      </Tabs>

      {/* Composer Modal */}
      {selectedJob && (
        <XPostComposer
          job={selectedJob}
          open={composerOpen}
          onOpenChange={setComposerOpen}
          onPosted={() => markAsPosted(selectedJob.id)}
          onFailed={(msg) => markAsFailed(selectedJob.id, msg)}
        />
      )}
    </div>
  );
}
