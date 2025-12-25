// API Configuration for MCP Hub Backend

export const API_BASE = "http://13.205.132.169:8000";

// Response types from backend
export interface MotivationalPostResponse {
  topic: string;
  quote_text: string;
  image_url: string;
}

export interface BlogPostResponse {
  topic: string;
  docx_url: string;
  cover_url: string;
}

export interface ChatResponse {
  text: string;
}

export interface HealthResponse {
  status: string;
}

// Content list response types
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

// API client with error handling
export async function apiClient<T>(
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
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  // Handle empty responses (e.g., DELETE)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Typed API functions
export const api = {
  generateMotivationalPost: (topic: string) =>
    apiClient<MotivationalPostResponse>("/api/v1/generate/motivational_post", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }),

  generateBlogPost: (topic: string) =>
    apiClient<BlogPostResponse>("/api/v1/generate/blog_post", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }),

  chat: (text: string) =>
    apiClient<ChatResponse>("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  healthCheck: () => apiClient<HealthResponse>("/health"),

  // Content list endpoints
  listBlogs: () => apiClient<BlogItem[]>("/api/v1/content/blogs"),
  listImages: () => apiClient<ImageItem[]>("/api/v1/content/images"),

  // Content delete endpoints
  deleteBlog: (id: string) =>
    apiClient<void>(`/api/v1/content/blogs/${id}`, { method: "DELETE" }),
  deleteImage: (id: string) =>
    apiClient<void>(`/api/v1/content/images/${id}`, { method: "DELETE" }),
};
