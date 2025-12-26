import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PostingJob, PostingStatus } from "@/types/mcp";
import { toast } from "sonner";

export function usePostingJobs(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  // Query for ready jobs
  const readyJobsQuery = useQuery({
    queryKey: ["posting-jobs", "ready", workspaceId],
    queryFn: () => api.postingJobs.getReady(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Query for all jobs (with optional status filter)
  const useAllJobs = (statusFilter?: PostingStatus) => {
    return useQuery({
      queryKey: ["posting-jobs", "all", workspaceId, statusFilter],
      queryFn: () => api.postingJobs.getAll(workspaceId!, statusFilter),
      enabled: !!workspaceId,
    });
  };

  // Mark as posted mutation
  const markPostedMutation = useMutation({
    mutationFn: (jobId: string) => api.postingJobs.markPosted(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posting-jobs"] });
      toast.success("Post marked as completed!");
    },
    onError: (error) => {
      toast.error("Failed to mark as posted", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Mark as failed mutation
  const markFailedMutation = useMutation({
    mutationFn: ({ jobId, errorMessage }: { jobId: string; errorMessage?: string }) =>
      api.postingJobs.markFailed(jobId, errorMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posting-jobs"] });
      toast.info("Post marked as failed");
    },
    onError: (error) => {
      toast.error("Failed to update status", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Retry mutation
  const retryMutation = useMutation({
    mutationFn: (jobId: string) => api.postingJobs.retry(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posting-jobs"] });
      toast.success("Post queued for retry");
    },
    onError: (error) => {
      toast.error("Failed to retry", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: ({ jobId, scheduledFor }: { jobId: string; scheduledFor: Date }) =>
      api.postingJobs.schedule(jobId, scheduledFor.toISOString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posting-jobs"] });
    },
    onError: (error) => {
      toast.error("Failed to schedule post", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Cancel schedule mutation
  const cancelScheduleMutation = useMutation({
    mutationFn: (jobId: string) => api.postingJobs.cancelSchedule(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posting-jobs"] });
    },
    onError: (error) => {
      toast.error("Failed to cancel schedule", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  return {
    readyJobs: readyJobsQuery.data ?? [],
    isLoading: readyJobsQuery.isLoading,
    error: readyJobsQuery.error,
    refetch: readyJobsQuery.refetch,
    useAllJobs,
    markAsPosted: (jobId: string) => markPostedMutation.mutateAsync(jobId),
    markAsFailed: (jobId: string, errorMessage?: string) =>
      markFailedMutation.mutateAsync({ jobId, errorMessage }),
    retry: (jobId: string) => retryMutation.mutateAsync(jobId),
    schedule: (jobId: string, scheduledFor: Date) =>
      scheduleMutation.mutateAsync({ jobId, scheduledFor }),
    cancelSchedule: (jobId: string) => cancelScheduleMutation.mutateAsync(jobId),
    isMarkingPosted: markPostedMutation.isPending,
    isMarkingFailed: markFailedMutation.isPending,
    isRetrying: retryMutation.isPending,
    isScheduling: scheduleMutation.isPending,
    isCancellingSchedule: cancelScheduleMutation.isPending,
  };
}
