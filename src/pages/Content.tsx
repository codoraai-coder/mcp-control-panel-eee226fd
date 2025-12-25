import { useState } from "react";
import { FileText, Image, FileEdit, Plus, Eye, Edit2, CheckCircle, Workflow, Download } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Content as ContentType } from "@/types/mcp";
import { useGenerationJobs } from "@/contexts/GenerationJobsContext";
import { GeneratingJobsPanel } from "@/components/content/GeneratingJobsPanel";
import { DocxPreviewDialog } from "@/components/content/DocxPreviewDialog";

// Initial content (will be replaced with API data later)
const initialBlogs: ContentType[] = [];
const initialImages: ContentType[] = [];

function ContentCard({ content, onAction }: { content: ContentType; onAction: (action: string, content: ContentType) => void }) {
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
  const [blogs, setBlogs] = useState<ContentType[]>(initialBlogs);
  const [images, setImages] = useState<ContentType[]>(initialImages);
  const [previewContent, setPreviewContent] = useState<ContentType | null>(null);

  const handleAction = (action: string, content: ContentType) => {
    switch (action) {
      case 'view':
        if (content.docxUrl) {
          // Open DOCX preview dialog for blog posts
          setPreviewContent(content);
        } else if (content.imageUrl || content.thumbnailUrl) {
          // Open image in new tab
          window.open(content.imageUrl || content.thumbnailUrl, '_blank');
        } else {
          toast.info(`Viewing: ${content.title}`);
        }
        break;
      case 'edit':
        toast.info(`Editing: ${content.title}`);
        break;
      case 'approve':
        toast.success(`Approved: ${content.title}`);
        break;
      case 'use':
        toast.info(`Using in workflow: ${content.title}`);
        break;
    }
  };

  const handleContentGenerated = (content: ContentType) => {
    if (content.type === 'image') {
      setImages(prev => [content, ...prev]);
    } else {
      setBlogs(prev => [content, ...prev]);
    }
    toast.success(`${content.type === 'blog' ? 'Blog' : 'Image'} added to your content!`);
  };

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
      </div>

      {/* Generation Jobs Panel */}
      <GeneratingJobsPanel onContentGenerated={handleContentGenerated} />

      {/* Tabs */}
      <Tabs defaultValue="blogs" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="blogs" className="gap-2">
              <FileText className="h-4 w-4" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <Image className="h-4 w-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <FileEdit className="h-4 w-4" />
              Drafts
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="blogs" className="space-y-4">
          <div className="flex justify-end">
            <GenerateDialog type="blog" onClose={() => {}} />
          </div>
          {blogs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <ContentCard key={blog.id} content={blog} onAction={handleAction} />
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
            <GenerateDialog type="image" onClose={() => {}} />
          </div>
          {images.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <ContentCard key={image.id} content={image} onAction={handleAction} />
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No drafts yet</p>
            </CardContent>
          </Card>
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
