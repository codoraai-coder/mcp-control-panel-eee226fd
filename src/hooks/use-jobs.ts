import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Job } from "@/types/mcp";

// Hook for fetching jobs by workflow
export function useWorkflowJobs(workflowId: string | undefined, limit = 10) {
  const jobsQuery = useQuery({
    queryKey: ["jobs", "workflow", workflowId, limit],
    queryFn: () => api.jobs.listByWorkflow(workflowId!, limit),
    enabled: !!workflowId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if there are running jobs
      const data = query.state.data;
      const hasRunningJobs = data?.some(
        (job) => job.status === "pending" || job.status === "running"
      );
      return hasRunningJobs ? 3000 : false;
    },
  });

  return {
    jobs: jobsQuery.data ?? [],
    isLoading: jobsQuery.isLoading,
    error: jobsQuery.error,
    refetch: jobsQuery.refetch,
  };
}

// Hook for polling a single job status
export function useJobStatus(jobId: string | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startPolling = useCallback(async () => {
    if (!jobId) return;
    setIsPolling(true);
    setError(null);
  }, [jobId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!jobId || !isPolling) return;

    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      try {
        const data = await api.jobs.get(jobId);
        if (cancelled) return;

        setJob(data);

        // Stop polling on terminal states
        if (data.status === "completed" || data.status === "failed") {
          setIsPolling(false);
          return;
        }

        // Continue polling
        timeoutId = setTimeout(poll, 2000);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error("Failed to fetch job"));
        setIsPolling(false);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jobId, isPolling]);

  return {
    job,
    isPolling,
    error,
    startPolling,
    stopPolling,
  };
}

// Hook for getting a single job (without polling)
export function useJob(jobId: string | undefined) {
  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => api.jobs.get(jobId!),
    enabled: !!jobId,
  });

  return {
    job: jobQuery.data,
    isLoading: jobQuery.isLoading,
    error: jobQuery.error,
    refetch: jobQuery.refetch,
  };
}
