import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Content, ContentListParams, UpdateContentDto, ContentStatus, ContentType as ContentTypeEnum } from "@/types/mcp";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function useContentData(params: ContentListParams = {}) {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  // Fetch all content with optional filters
  const contentQuery = useQuery({
    queryKey: ["content", params],
    queryFn: () => api.content.list(params),
  });

  // Fetch pending content for the current workspace
  const pendingQuery = useQuery({
    queryKey: ["content", "pending", workspace?.id],
    queryFn: () => workspace?.id 
      ? api.content.getPending(workspace.id) 
      : Promise.resolve([]),
    enabled: !!workspace?.id,
  });

  // Get single content item
  const useContentItem = (contentId: string) => {
    return useQuery({
      queryKey: ["content", contentId],
      queryFn: () => api.content.get(contentId),
      enabled: !!contentId,
    });
  };

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContentDto }) =>
      api.content.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update content: ${error.message}`);
    },
  });

  // Approve content mutation
  const approveContentMutation = useMutation({
    mutationFn: api.content.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content approved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve content: ${error.message}`);
    },
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: api.content.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete content: ${error.message}`);
    },
  });

  // Derive blogs and images from content
  const allContent = contentQuery.data ?? [];
  const blogs = allContent.filter((c) => c.type === "blog" || c.content_type === "blog");
  const images = allContent.filter((c) => c.type === "image" || c.content_type === "image");
  const drafts = allContent.filter((c) => c.status === "draft");
  const approved = allContent.filter((c) => c.status === "approved");
  const pending = pendingQuery.data ?? [];

  // Combined loading state
  const isLoading = contentQuery.isLoading;
  const isFetching = contentQuery.isFetching || pendingQuery.isFetching;

  // Combined error
  const error = contentQuery.error || pendingQuery.error;

  // Refetch all content
  const refetch = () => {
    contentQuery.refetch();
    pendingQuery.refetch();
  };

  return {
    // Data
    content: allContent,
    blogs,
    images,
    drafts,
    approved,
    pending,

    // Loading states
    isLoading,
    isFetching,
    error,

    // Actions
    refetch,
    refetchBlogs: () => contentQuery.refetch(),
    refetchImages: () => contentQuery.refetch(),
    
    // Mutations
    updateContent: (id: string, data: UpdateContentDto) =>
      updateContentMutation.mutate({ id, data }),
    approveContent: (id: string) => approveContentMutation.mutate(id),
    deleteContent: (id: string) => deleteContentMutation.mutate(id),

    // Legacy compatibility - deleteBlog/deleteImage now use unified delete
    deleteBlog: (id: string) => deleteContentMutation.mutate(id),
    deleteImage: (id: string) => deleteContentMutation.mutate(id),

    // Mutation states
    isUpdating: updateContentMutation.isPending,
    isApproving: approveContentMutation.isPending,
    isDeleting: deleteContentMutation.isPending,
    isDeletingBlog: deleteContentMutation.isPending,
    isDeletingImage: deleteContentMutation.isPending,

    // Hook for single item
    useContentItem,
  };
}

// Separate hook for fetching content by type
export function useContentByType(type: ContentTypeEnum) {
  return useContentData({ content_type: type });
}

// Separate hook for fetching content by status
export function useContentByStatus(status: ContentStatus) {
  return useContentData({ status });
}

// Hook for pending approval content
export function usePendingContent() {
  const { workspace } = useWorkspace();

  return useQuery({
    queryKey: ["content", "pending", workspace?.id],
    queryFn: () => workspace?.id
      ? api.content.getPending(workspace.id)
      : Promise.resolve([]),
    enabled: !!workspace?.id,
  });
}
