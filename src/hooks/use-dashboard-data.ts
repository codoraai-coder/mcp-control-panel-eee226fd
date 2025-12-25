import { useContentData } from "./use-content-data";
import { useGenerationJobs } from "@/contexts/GenerationJobsContext";

export function useDashboardData() {
  const { blogs, images, isLoading, error, refetch } = useContentData();
  const { activeJobs, completedJobs } = useGenerationJobs();

  const stats = {
    totalContent: blogs.length + images.length,
    activeWorkflows: 5, // Placeholder until workflow API exists
    scheduledPosts: 0,  // Placeholder until posting API exists
    runningJobs: activeJobs.length,
  };

  // Generate recent activity from real content
  const recentActivity = [...blogs, ...images]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(content => ({
      id: content.id,
      type: content.type === 'blog' ? 'content_created' : 'image_created',
      message: `${content.type === 'blog' ? 'Blog' : 'Image'} "${content.title}" generated`,
      timestamp: content.createdAt,
    }));

  // Map generation jobs to display format
  const displayJobs = activeJobs.map(job => ({
    id: job.id,
    workflowName: `${job.type === 'blog' ? 'Blog' : 'Image'}: ${job.topic}`,
    status: job.status === 'generating' ? 'running' as const : job.status as 'pending' | 'completed' | 'failed',
    progress: job.status === 'completed' ? 100 : job.status === 'generating' ? 50 : 0,
  }));

  // Include recent completed jobs too
  const recentCompletedJobs = completedJobs.slice(0, 3).map(job => ({
    id: job.id,
    workflowName: `${job.type === 'blog' ? 'Blog' : 'Image'}: ${job.topic}`,
    status: job.status as 'completed' | 'failed',
    progress: job.status === 'completed' ? 100 : 0,
  }));

  const allJobs = [...displayJobs, ...recentCompletedJobs];

  return {
    stats,
    recentActivity,
    jobs: allJobs,
    isLoading,
    error,
    refetch,
  };
}
