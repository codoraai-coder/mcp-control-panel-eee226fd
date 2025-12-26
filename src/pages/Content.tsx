import { useState } from "react";
import { FileText, Image, FileEdit, Plus, Eye, Edit2, CheckCircle, Workflow, Download, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Content as ContentType } from "@/types/mcp";
import { useGenerationJobs } from "@/contexts/GenerationJobsContext";
import { GeneratingJobsPanel } from "@/components/content/GeneratingJobsPanel";
import { DocxPreviewDialog } from "@/components/content/DocxPreviewDialog";
import { useContentData } from "@/hooks/use-content-data";

function ContentCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <Skeleton className="aspect-video rounded-lg mb-3" />
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentCard({ 
  content, 
  onAction,
  onDelete,
}: { 
  content: ContentType; 
  onAction: (action: string, content: ContentType) => void;
  onDelete: (content: ContentType) => void;
}) {
  const imageUrl = content.imageUrl || content.thumbnailUrl || content.coverUrl;
  
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4">
        {imageUrl && (
          <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
            <img src={imageUrl} alt={content.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1">{content.title}</h3>
            <StatusBadge status={content.status} />
          </div>
          {content.quoteText && (
            <p className="text-sm text-muted-foreground italic line-clamp-2">"{content.quoteText}"</p>
          )}
          {content.description && !content.quoteText && (
            <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(content.createdAt).toLocaleDateString()}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => onAction('view', content)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {content.docxUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={content.docxUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  DOCX
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onAction('edit', content)}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {content.status === 'draft' && (
              <Button variant="ghost" size="sm" onClick={() => onAction('approve', content)}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
            {content.status === 'approved' && (
              <Button variant="ghost" size="sm" onClick={() => onAction('use', content)}>
                <Workflow className="h-4 w-4 mr-1" />
                Use
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this content?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete "{content.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(content)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerateDialog({ 
  type, 
  onClose 
}: { 
  type: 'blog' | 'image'; 
  onClose: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [open, setOpen] = useState(false);
  const { startBlogGeneration, startImageGeneration } = useGenerationJobs();

  const handleSubmit = () => {
    if (!topic.trim()) return;

    if (type === 'image') {
      startImageGeneration(topic);
    } else {
      startBlogGeneration(topic);
    }
    
    setOpen(false);
    setTopic("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Generate {type === 'blog' ? 'Blog' : 'Image'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Generate {type === 'blog' ? 'RAG Blog Post' : 'Motivational Image'}
          </DialogTitle>
          <DialogDescription>
            {type === 'blog' 
              ? 'Enter a topic and we\'ll generate a comprehensive blog post with RAG. This may take 5-10 minutes - you can continue using the app while it generates.'
              : 'Enter a topic to generate a motivational quote image.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder={type === 'blog' 
                ? 'e.g., The Future of AI in Healthcare' 
                : 'e.g., Success and perseverance'}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && topic.trim()) {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!topic.trim()}
            className="gradient-primary text-primary-foreground"
          >
            Start Generating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Content() {
  const [previewContent, setPreviewContent] = useState<ContentType | null>(null);
  const { 
    blogs, 
    images,
    drafts,
    isLoading, 
    isFetching,
    error,
    refetch, 
    refetchBlogs,
    refetchImages,
    approveContent,
    deleteContent,
  } = useContentData();

  const handleAction = (action: string, content: ContentType) => {
    switch (action) {
      case 'view':
        if (content.docxUrl) {
          setPreviewContent(content);
        } else if (content.imageUrl || content.thumbnailUrl) {
          window.open(content.imageUrl || content.thumbnailUrl, '_blank');
        } else {
          toast.info(`Viewing: ${content.title}`);
        }
        break;
      case 'edit':
        toast.info(`Editing: ${content.title}`);
        break;
      case 'approve':
        approveContent(content.id);
        break;
      case 'use':
        toast.info(`Using in workflow: ${content.title}`);
        break;
    }
  };

  const handleDelete = (content: ContentType) => {
    deleteContent(content.id);
  };

  const handleContentGenerated = () => {
    // Refetch content after generation completes
    refetch();
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content</h1>
            <p className="text-muted-foreground mt-1">Generate and manage your AI content</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">Failed to load content</p>
            <p className="text-sm text-muted-foreground mb-4">{(error as Error).message}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage your AI content
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Generation Jobs Panel */}
      <GeneratingJobsPanel onContentGenerated={handleContentGenerated} />

      {/* Tabs */}
      <Tabs defaultValue="blogs" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="blogs" className="gap-2">
              <FileText className="h-4 w-4" />
              Blogs ({blogs.length})
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <Image className="h-4 w-4" />
              Images ({images.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <FileEdit className="h-4 w-4" />
              Drafts ({drafts.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="blogs" className="space-y-4">
          <div className="flex justify-end">
            <GenerateDialog type="blog" onClose={() => refetchBlogs()} />
          </div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContentCardSkeleton />
              <ContentCardSkeleton />
              <ContentCardSkeleton />
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <ContentCard 
                  key={blog.id} 
                  content={blog} 
                  onAction={handleAction} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No blog posts yet</p>
                <p className="text-sm text-muted-foreground">Generate your first RAG blog post above</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-end">
            <GenerateDialog type="image" onClose={() => refetchImages()} />
          </div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContentCardSkeleton />
              <ContentCardSkeleton />
              <ContentCardSkeleton />
            </div>
          ) : images.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <ContentCard 
                  key={image.id} 
                  content={image} 
                  onAction={handleAction} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No images yet</p>
                <p className="text-sm text-muted-foreground">Generate your first motivational image above</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContentCardSkeleton />
              <ContentCardSkeleton />
              <ContentCardSkeleton />
            </div>
          ) : drafts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drafts.map((draft) => (
                <ContentCard 
                  key={draft.id} 
                  content={draft} 
                  onAction={handleAction} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No drafts yet</p>
                <p className="text-sm text-muted-foreground mt-1">Generated content will appear here for review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* DOCX Preview Dialog */}
      {previewContent?.docxUrl && (
        <DocxPreviewDialog
          open={!!previewContent}
          onOpenChange={(open) => !open && setPreviewContent(null)}
          title={previewContent.title}
          docxUrl={previewContent.docxUrl}
        />
      )}
    </div>
  );
}
