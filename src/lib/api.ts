// API Configuration for MCP Hub Backend

import {
  Workspace,
  CreateWorkspaceDto,
  Workflow,
  WorkflowListItem,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  Job,
  RunWorkflowResponse,
  Content,
  UpdateContentDto,
  ContentListParams,
  BlogPostResponse,
  MotivationalPostResponse,
  CaptionResponse,
  HashtagResponse,
  OptimizeResponse,
  BlogItem,
  ImageItem,
  HealthResponse,
  DeleteResponse,
  ChatResponse,
  CaptionConfig,
  HashtagConfig,
  ContentOptimizeConfig,
  PostingJob,
  PostingStatus,
} from '@/types/mcp';

// Main API for workspaces, workflows, jobs, content CRUD
export const API_BASE = "http://35.154.24.159:8000";

// Generation API for blog/image generation
export const GENERATION_API_BASE = "http://13.205.132.169:8000";

// Re-export types for convenience
export type {
  Workspace,
  Workflow,
  WorkflowListItem,
  Job,
  RunWorkflowResponse,
  Content,
  BlogPostResponse,
  MotivationalPostResponse,
  CaptionResponse,
  HashtagResponse,
  OptimizeResponse,
  BlogItem,
  ImageItem,
  HealthResponse,
  DeleteResponse,
  ChatResponse,
};

// === API CLIENT ===

class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new APIError(`API Error (${response.status}): ${errorMessage}`, response.status);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Separate client for generation endpoints (different server)
async function generationApiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${GENERATION_API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new APIError(`API Error (${response.status}): ${errorMessage}`, response.status);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// === WORKSPACE API ===

const workspaces = {
  create: (data: CreateWorkspaceDto) =>
    apiClient<Workspace>("/api/workspaces/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (workspaceId: string) =>
    apiClient<Workspace>(`/api/workspaces/${workspaceId}`),
};

// === WORKFLOWS API ===

const workflows = {
  list: (workspaceId: string) =>
    apiClient<WorkflowListItem[]>(`/api/workflows/?workspace_id=${workspaceId}`),

  get: (workflowId: string) =>
    apiClient<Workflow>(`/api/workflows/${workflowId}`),

  create: (data: CreateWorkflowDto) =>
    apiClient<Workflow>("/api/workflows/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (workflowId: string, data: UpdateWorkflowDto) =>
    apiClient<Workflow>(`/api/workflows/${workflowId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (workflowId: string) =>
    apiClient<DeleteResponse>(`/api/workflows/${workflowId}`, {
      method: "DELETE",
    }),

  run: (workflowId: string) =>
    apiClient<RunWorkflowResponse>(`/api/workflows/${workflowId}/run`, {
      method: "POST",
    }),
};

// === JOBS API ===

const jobs = {
  get: (jobId: string) =>
    apiClient<Job>(`/api/jobs/${jobId}`),

  listByWorkflow: (workflowId: string, limit = 10) =>
    apiClient<Job[]>(`/api/jobs/workflow/${workflowId}?limit=${limit}`),
};

// === CONTENT API ===

const content = {
  list: (params: ContentListParams = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    return generationApiClient<Content[]>(`/api/content/?${query}`);
  },

  get: (contentId: string) =>
    generationApiClient<Content>(`/api/content/${contentId}`),

  update: (contentId: string, data: UpdateContentDto) =>
    generationApiClient<Content>(`/api/content/${contentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  approve: (contentId: string) =>
    generationApiClient<Content>(`/api/content/${contentId}/approve`, {
      method: "POST",
    }),

  delete: (contentId: string) =>
    generationApiClient<DeleteResponse>(`/api/content/${contentId}`, {
      method: "DELETE",
    }),

  getPending: (workspaceId: string, limit = 20) =>
    generationApiClient<Content[]>(`/api/content/workspace/${workspaceId}/pending?limit=${limit}`),
};

// === GENERATION API (Direct Tools) ===

const generate = {
  blogPost: (topic: string) =>
    generationApiClient<BlogPostResponse>("/api/v1/generate/blog_post", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }),

  motivationalPost: (topic: string) =>
    generationApiClient<MotivationalPostResponse>("/api/v1/generate/motivational_post", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }),

  caption: (config: CaptionConfig) =>
    generationApiClient<CaptionResponse>("/api/v1/generate/caption", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  hashtags: (config: HashtagConfig) =>
    generationApiClient<HashtagResponse>("/api/v1/generate/hashtags", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  optimize: (config: ContentOptimizeConfig) =>
    generationApiClient<OptimizeResponse>("/api/v1/generate/optimize", {
      method: "POST",
      body: JSON.stringify(config),
    }),
};

// === LEGACY CONTENT ENDPOINTS ===

const legacyContent = {
  listBlogs: () => generationApiClient<BlogItem[]>("/api/v1/content/blogs"),
  listImages: () => generationApiClient<ImageItem[]>("/api/v1/content/images"),
  deleteBlog: (id: string) =>
    generationApiClient<void>(`/api/v1/content/blogs/${id}`, { method: "DELETE" }),
  deleteImage: (id: string) =>
    generationApiClient<void>(`/api/v1/content/images/${id}`, { method: "DELETE" }),
};

// === POSTING JOBS API ===

const postingJobs = {
  getReady: (workspaceId: string, limit = 50) =>
    apiClient<PostingJob[]>(`/api/posting-jobs/workspace/${workspaceId}/ready?limit=${limit}`),

  getAll: (workspaceId: string, statusFilter?: PostingStatus, limit = 100) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (statusFilter) params.append('status_filter', statusFilter);
    return apiClient<PostingJob[]>(`/api/posting-jobs/workspace/${workspaceId}/all?${params}`);
  },

  get: (jobId: string) =>
    apiClient<PostingJob>(`/api/posting-jobs/${jobId}`),

  markPosted: (jobId: string) =>
    apiClient<PostingJob>(`/api/posting-jobs/${jobId}/mark-posted`, { method: 'POST' }),

  markFailed: (jobId: string, errorMessage?: string) => {
    const params = errorMessage ? `?error_message=${encodeURIComponent(errorMessage)}` : '';
    return apiClient<PostingJob>(`/api/posting-jobs/${jobId}/mark-failed${params}`, { method: 'POST' });
  },

  retry: (jobId: string) =>
    apiClient<PostingJob>(`/api/posting-jobs/${jobId}/retry`, { method: 'POST' }),
};

// === UTILITY ===

// Health check uses generation server
const healthCheck = () => generationApiClient<HealthResponse>("/health");

// Chat uses generation server
const chat = (text: string) =>
  generationApiClient<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({ text }),
  });

// === MAIN API EXPORT ===

export const api = {
  // Workspace
  workspaces,

  // Workflows
  workflows,

  // Jobs
  jobs,

  // Content (new API)
  content,

  // Generation (direct tools)
  generate,

  // Legacy content endpoints
  legacy: legacyContent,

  // Posting jobs
  postingJobs,

  // Utility
  healthCheck,
  chat,

  // Legacy compatibility aliases
  generateMotivationalPost: generate.motivationalPost,
  generateBlogPost: generate.blogPost,
  listBlogs: legacyContent.listBlogs,
  listImages: legacyContent.listImages,
  deleteBlog: legacyContent.deleteBlog,
  deleteImage: legacyContent.deleteImage,
};

// === JOB POLLING UTILITY ===

export async function waitForJobCompletion(
  jobId: string,
  onProgress?: (job: Job) => void,
  pollInterval = 2000,
  timeout = 300000
): Promise<Job> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const interval = setInterval(async () => {
      try {
        const job = await api.jobs.get(jobId);
        onProgress?.(job);

        if (job.status === 'completed') {
          clearInterval(interval);
          resolve(job);
        } else if (job.status === 'failed') {
          clearInterval(interval);
          reject(new Error(job.error || 'Job failed'));
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error('Job timeout'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, pollInterval);
  });
}

export { APIError };
