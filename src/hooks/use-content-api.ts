import { useMutation } from "@tanstack/react-query";
import { api, MotivationalPostResponse, BlogPostResponse } from "@/lib/api";

export function useGenerateMotivationalPost() {
  return useMutation({
    mutationFn: (topic: string) => api.generateMotivationalPost(topic),
    mutationKey: ["generate", "motivational-post"],
  });
}

export function useGenerateBlogPost() {
  return useMutation({
    mutationFn: (topic: string) => api.generateBlogPost(topic),
    mutationKey: ["generate", "blog-post"],
  });
}

export type { MotivationalPostResponse, BlogPostResponse };
