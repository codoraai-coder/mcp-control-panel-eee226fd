import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BlogItem, ImageItem, Content, ContentStatus } from "@/types/mcp";
import { toast } from "sonner";

// Transform BlogItem to Content format for UI compatibility
function blogToContent(blog: BlogItem): Content {
  return {
    id: blog.id,
    title: blog.topic,
    type: 'blog',
    content_type: 'blog',
    status: 'approved' as ContentStatus,
    createdAt: blog.created_at,
    created_at: blog.created_at,
    docxUrl: blog.docx_url,
    coverUrl: blog.cover_url,
    imageUrl: blog.cover_url,
  };
}

// Transform ImageItem to Content format for UI compatibility
function imageToContent(image: ImageItem): Content {
  return {
    id: image.id,
    title: image.topic,
    type: 'image',
    content_type: 'image',
    status: 'approved' as ContentStatus,
    createdAt: image.created_at,
    created_at: image.created_at,
    imageUrl: image.image_url,
    thumbnailUrl: image.image_url,
    quoteText: image.quote_text,
  };
}

export function useContentData() {
  const queryClient = useQueryClient();

  // Fetch blogs using legacy API
  const blogsQuery = useQuery({
    queryKey: ["blogs"],
    queryFn: () => api.legacy.listBlogs(),
  });

  // Fetch images using legacy API
  const imagesQuery = useQuery({
    queryKey: ["images"],
    queryFn: () => api.legacy.listImages(),
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => api.legacy.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete blog: ${error.message}`);
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: (id: string) => api.legacy.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete image: ${error.message}`);
    },
  });

  // Transform raw data to Content format
  const blogs: Content[] = (blogsQuery.data ?? []).map(blogToContent);
  const images: Content[] = (imagesQuery.data ?? []).map(imageToContent);
  const allContent = [...blogs, ...images];
  const drafts = allContent.filter((c) => c.status === "draft");
  const approved = allContent.filter((c) => c.status === "approved");

  // Combined loading state
  const isLoading = blogsQuery.isLoading || imagesQuery.isLoading;
  const isFetching = blogsQuery.isFetching || imagesQuery.isFetching;

  // Combined error
  const error = blogsQuery.error || imagesQuery.error;

  // Refetch all content
  const refetch = () => {
    blogsQuery.refetch();
    imagesQuery.refetch();
  };

  // Delete content - determine type and call appropriate mutation
  const deleteContent = (id: string) => {
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      deleteBlogMutation.mutate(id);
    } else {
      deleteImageMutation.mutate(id);
    }
  };

  return {
    // Data
    content: allContent,
    blogs,
    images,
    drafts,
    approved,
    pending: [],

    // Loading states
    isLoading,
    isFetching,
    error,

    // Actions
    refetch,
    refetchBlogs: () => blogsQuery.refetch(),
    refetchImages: () => imagesQuery.refetch(),
    
    // Mutations
    deleteContent,
    deleteBlog: (id: string) => deleteBlogMutation.mutate(id),
    deleteImage: (id: string) => deleteImageMutation.mutate(id),

    // Legacy approve - no-op for now since legacy API doesn't support it
    approveContent: (id: string) => {
      toast.info("Approve not supported in legacy API");
    },

    // Mutation states
    isDeleting: deleteBlogMutation.isPending || deleteImageMutation.isPending,
    isDeletingBlog: deleteBlogMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending,
  };
}
