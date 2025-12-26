// MCP Hub Types - Master Control Program

// === STRING LITERAL TYPES (for compatibility with existing code) ===

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ContentType = 'blog' | 'image' | 'blog_post' | 'caption' | 'hashtags' | 'optimized_content';
export type ContentStatus = 'draft' | 'approved' | 'used' | 'posted';
export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook';

// === WORKSPACE ===

export interface Workspace {
  id: string;
  owner_user_id: string;
  name: string;
  created_at: string;
}

export interface CreateWorkspaceDto {
  owner_user_id: string;
  name: string;
}

// === WORKFLOW ===

// Step reference for context-aware workflows
export interface StepReference {
  type: 'manual' | 'step_reference';
  step_index?: number;  // 0-based index of source step
  field?: string;       // Which output field to use
  manual_value?: string | number | boolean;
}

// Tool I/O definition for context flow
export interface ToolIODefinition {
  produces: string[];  // What outputs this tool creates
  consumes: string[];  // What inputs this tool can accept from previous steps
}

export interface WorkflowStep {
  id?: string;
  order: number;
  name?: string;
  tool_name?: string;
  toolName?: string; // Legacy alias - use tool_name || toolName
  config?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  workspace_id?: string;
  name: string;
  description?: string;
  target_platform?: string;
  targetPlatform?: string; // Legacy alias
  steps: WorkflowStep[];
  last_run_at?: string;
  lastRunAt?: string; // Legacy alias
  last_run_status?: JobStatus;
  lastRunStatus?: JobStatus; // Legacy alias
  created_at?: string;
  createdAt?: string; // Legacy alias
  updated_at?: string;
}

export interface WorkflowListItem {
  id: string;
  name: string;
  description?: string;
  target_platform?: string;
  last_run_at?: string;
  last_run_status?: JobStatus;
  created_at: string;
}

export interface CreateWorkflowDto {
  workspace_id: string;
  name: string;
  description?: string;
  target_platform?: string;
  steps: Omit<WorkflowStep, 'id'>[];
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  target_platform?: string;
  steps?: Omit<WorkflowStep, 'id'>[];
}

// === JOB ===

export interface Job {
  id: string;
  workflow_id?: string;
  workflowId?: string; // Legacy alias
  status: JobStatus;
  progress?: number;
  current_step?: number;
  logs?: Record<string, unknown> | string[];
  outputs?: Content[]; // Legacy field
  started_at?: string;
  startedAt?: string; // Legacy alias
  completed_at?: string;
  completedAt?: string; // Legacy alias
  error?: string;
}

export interface RunWorkflowResponse {
  job_id: string;
  workflow_id: string;
  status: JobStatus;
  started_at: string;
}

// === CONTENT ===

export interface Content {
  id: string;
  workspace_id?: string;
  job_id?: string;
  workflow_step_id?: string;
  content_type?: ContentType;
  type?: ContentType; // Legacy alias
  title?: string;
  description?: string;
  data?: Record<string, unknown>;
  status: ContentStatus;
  created_at?: string;
  createdAt?: string; // Legacy alias
  updated_at?: string;
  updatedAt?: string; // Legacy alias
  approved_at?: string;
  posted_at?: string;
  // Legacy fields for frontend compatibility
  s3Url?: string;
  thumbnailUrl?: string;
  quoteText?: string;
  docxUrl?: string;
  coverUrl?: string;
  imageUrl?: string;
}

export interface UpdateContentDto {
  title?: string;
  data?: Record<string, unknown>;
  status?: ContentStatus;
}

export interface ContentListParams {
  workspace_id?: string;
  job_id?: string;
  content_type?: ContentType;
  status?: ContentStatus;
  limit?: number;
}

// === PLATFORM ===

export interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  accountName?: string;
}

// === TOOL CONFIGS ===

export interface CaptionConfig {
  topic: string;
  platform?: string;
  tone?: 'professional' | 'casual' | 'humorous';
  include_emojis?: boolean;
  include_hashtags?: boolean;
}

export interface HashtagConfig {
  topic: string;
  count?: number;
  platform?: string;
}

export interface ContentOptimizeConfig {
  content: string;
  goal?: 'engagement' | 'clarity' | 'seo';
  audience?: 'professionals' | 'general';
  platform?: string;
}

export interface BlogConfig {
  topic: string;
  style?: 'informative' | 'storytelling' | 'tutorial';
}

// === GENERATION API RESPONSES ===

export interface BlogPostResponse {
  id: string;
  topic: string;
  docx_url: string;
  cover_url: string;
  created_at: string;
}

export interface MotivationalPostResponse {
  id: string;
  topic: string;
  quote_text: string;
  image_url: string;
  created_at: string;
}

export interface CaptionResponse {
  id: string;
  caption: string;
  platform: string;
  tone: string;
  created_at: string;
}

export interface HashtagResponse {
  id: string;
  hashtags: string[];
  count: number;
  platform: string;
  created_at: string;
}

export interface OptimizeResponse {
  id: string;
  original: string;
  optimized: string;
  goal: string;
  platform: string;
  created_at: string;
}

// === LEGACY TYPES (for backward compatibility) ===

export interface BlogItem {
  id: string;
  topic: string;
  docx_url: string;
  cover_url: string;
  created_at: string;
}

export interface ImageItem {
  id: string;
  topic: string;
  quote_text: string;
  image_url: string;
  created_at: string;
}

// === ACTIVITY ===

export interface Activity {
  id: string;
  type: 'content_created' | 'workflow_run' | 'content_posted' | 'job_completed' | 'job_failed' | 'image_created';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// === ANALYTICS ===

export interface AnalyticsMetric {
  label: string;
  value: number;
  change?: number;
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

// === POST SCHEDULE ===

export interface PostSchedule {
  contentId: string;
  platformId: string;
  scheduledFor?: string;
}

// === API RESPONSE WRAPPERS ===

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

export interface HealthResponse {
  status: string;
}

export interface DeleteResponse {
  message: string;
  content_id?: string;
  deleted_at?: string;
}

export interface ChatResponse {
  text: string;
}

// === POSTING JOBS ===

export type PostingStatus = 'ready' | 'awaiting_user' | 'posted' | 'failed';

export interface FormattingHints {
  max_length: number;
  supports_markdown: boolean;
  supports_images: boolean;
  supports_videos: boolean;
}

export interface PreparedPayload {
  content_id: string;
  platform: string;
  post_text: string;
  image_url?: string;
  hashtags?: string[];
  formatting_hints: FormattingHints;
  created_at: string;
}

export interface PostingJob {
  id: string;
  workspace_id: string;
  content_id: string;
  platform: string;
  status: PostingStatus;
  prepared_payload: PreparedPayload;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  posted_at: string | null;
  scheduled_for?: string | null;
}
