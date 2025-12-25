import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, BlogItem, ImageItem } from "@/lib/api";
import type { Content as ContentType } from "@/types/mcp";
import { toast } from "sonner";

// Transform API BlogItem to frontend ContentType
function transformBlog(blog: BlogItem): ContentType {
  return {
    id: blog.id,
    type: "blog",
    title: blog.topic,
    status: "draft",
    docxUrl: blog.docx_url,
    coverUrl: blog.cover_url,
    createdAt: blog.created_at,
    updatedAt: blog.created_at,
  };
}

// Transform API ImageItem to frontend ContentType
function transformImage(image: ImageItem): ContentType {
  return {
    id: image.id,
    type: "image",
    title: image.topic,
    status: "draft",
    quoteText: image.quote_text,
    imageUrl: image.image_url,
    createdAt: image.created_at,
    updatedAt: image.created_at,
  };
}

export function useContentData() {
  const queryClient = useQueryClient();

  // Fetch blogs
  const blogsQuery = useQuery({
    queryKey: ["blogs"],
    queryFn: api.listBlogs,
  });

  // Fetch images
  const imagesQuery = useQuery({
    queryKey: ["images"],
    queryFn: api.listImages,
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: api.deleteBlog,
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
    mutationFn: api.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      toast.success("Image deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete image: ${error.message}`);
    },
  });

  // Transform data to ContentType format
  const blogs: ContentType[] = blogsQuery.data?.map(transformBlog) ?? [];
  const images: ContentType[] = imagesQuery.data?.map(transformImage) ?? [];

  // Combined loading state
  const isLoading = blogsQuery.isLoading || imagesQuery.isLoading;
  const isFetching = blogsQuery.isFetching || imagesQuery.isFetching;

  // Combined error
  const error = blogsQuery.error || imagesQuery.error;

  // Refetch both
  const refetch = () => {
    blogsQuery.refetch();
    imagesQuery.refetch();
  };

  // Refetch specific type
  const refetchBlogs = () => blogsQuery.refetch();
  const refetchImages = () => imagesQuery.refetch();

  return {
    blogs,
    images,
    isLoading,
    isFetching,
    error,
    refetch,
    refetchBlogs,
    refetchImages,
    deleteBlog: (id: string) => deleteBlogMutation.mutate(id),
    deleteImage: (id: string) => deleteImageMutation.mutate(id),
    isDeletingBlog: deleteBlogMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending,
  };
}
