import { useState, useCallback } from 'react';
import type { Job, JobStatus } from '@/types/mcp';

// Base API URL - replace with your actual backend URL
const API_BASE = '/api';

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(endpoint: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (body?: unknown) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  return { data, loading, error, execute };
}

// Hook for polling job status
export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<JobStatus>('pending');
  const [job, setJob] = useState<Job | null>(null);
  const [polling, setPolling] = useState(false);

  const startPolling = useCallback(async () => {
    if (!jobId) return;
    
    setPolling(true);
    
    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/jobs/${jobId}`);
        const data = await response.json();
        setJob(data);
        setStatus(data.status);
        
        if (data.status === 'pending' || data.status === 'running') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setPolling(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setPolling(false);
      }
    };
    
    poll();
  }, [jobId]);

  const stopPolling = useCallback(() => {
    setPolling(false);
  }, []);

  return { status, job, polling, startPolling, stopPolling };
}

// Mock data generators for development
export function useMockData() {
  return {
    workspaces: [
      { id: '1', name: 'My Workspace', createdAt: new Date().toISOString() },
      { id: '2', name: 'Team Workspace', createdAt: new Date().toISOString() },
    ],
    stats: {
      totalContent: 47,
      activeWorkflows: 5,
      scheduledPosts: 12,
      runningJobs: 2,
    },
    recentActivity: [
      { id: '1', type: 'content_created' as const, message: 'Blog post "AI Trends 2025" generated', timestamp: new Date().toISOString() },
      { id: '2', type: 'workflow_run' as const, message: 'LinkedIn Content Pipeline completed', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: '3', type: 'content_posted' as const, message: 'Image posted to LinkedIn', timestamp: new Date(Date.now() - 7200000).toISOString() },
    ],
  };
}
