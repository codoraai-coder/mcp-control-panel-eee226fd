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

  return response.json();
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
};
