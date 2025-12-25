// MCP Hub Types - Master Control Program

// Content states
export type ContentStatus = 'draft' | 'approved' | 'used' | 'posted';
export type ContentType = 'blog' | 'image';

// Job states
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Core entities
export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  status: ContentStatus;
  s3Url?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  workflowId?: string;
  // API response fields
  quoteText?: string;      // For motivational posts
  docxUrl?: string;        // For blog posts
  coverUrl?: string;       // Blog cover image
  imageUrl?: string;       // Generated image URL
}

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  toolName: string;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  targetPlatform?: string;
  steps: WorkflowStep[];
  lastRunAt?: string;
  lastRunStatus?: JobStatus;
  createdAt: string;
}

export interface Job {
  id: string;
  workflowId: string;
  status: JobStatus;
  progress?: number;
  logs?: string[];
  outputs?: Content[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface Activity {
  id: string;
  type: 'content_created' | 'workflow_run' | 'content_posted' | 'job_completed' | 'job_failed';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  accountName?: string;
}

export interface PostSchedule {
  contentId: string;
  platformId: string;
  scheduledFor?: string; // ISO date, null means post now
}

export interface AnalyticsMetric {
  label: string;
  value: number;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'neutral';
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  type: ContentType;
  views: number;
  engagement: number;
  clicks: number;
  platform: string;
}

// API response wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
