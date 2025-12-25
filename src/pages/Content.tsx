import { useState } from "react";
import { FileText, Image, FileEdit, Plus, Eye, Edit2, CheckCircle, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Content, ContentStatus } from "@/types/mcp";

// Mock content data
const mockBlogs: Content[] = [
  { id: '1', type: 'blog', title: 'AI Trends 2025', description: 'Exploring the future of artificial intelligence...', status: 'approved', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', type: 'blog', title: 'Building with MCP', description: 'How to leverage Master Control Program...', status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', type: 'blog', title: 'Automation Best Practices', description: 'Learn workflow automation strategies...', status: 'posted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const mockImages: Content[] = [
  { id: '4', type: 'image', title: 'Product Hero Image', status: 'approved', thumbnailUrl: '/placeholder.svg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', type: 'image', title: 'Social Media Banner', status: 'used', thumbnailUrl: '/placeholder.svg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const mockDrafts: Content[] = [
  { id: '6', type: 'blog', title: 'Untitled Draft', description: 'Work in progress...', status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

function ContentCard({ content, onAction }: { content: Content; onAction: (action: string, content: Content) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {content.type === 'image' && content.thumbnailUrl && (
          <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
            <img src={content.thumbnailUrl} alt={content.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1">{content.title}</h3>
            <StatusBadge status={content.status} />
          </div>
          {content.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(content.createdAt).toLocaleDateString()}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => onAction('view', content)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
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

function GenerateDialog({ type, onGenerate }: { type: 'blog' | 'image'; onGenerate: (data: { title: string; prompt: string }) => void }) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate MCP workflow trigger
    await new Promise(resolve => setTimeout(resolve, 1500));
    onGenerate({ title, prompt });
    setLoading(false);
    setOpen(false);
    setTitle("");
    setPrompt("");
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
          <DialogTitle>Generate {type === 'blog' ? 'Blog Post' : 'Image'}</DialogTitle>
          <DialogDescription>
            MCP will run a workflow to generate your content
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder={type === 'blog' ? 'e.g., AI in 2025' : 'e.g., Product Hero Image'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt / Instructions</Label>
            <Textarea
              id="prompt"
              placeholder={type === 'blog' 
                ? 'Describe what the blog should cover...' 
                : 'Describe the image you want to generate...'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title || !prompt || loading}
            className="gradient-primary text-primary-foreground"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Running MCP...
              </span>
            ) : (
              'Generate via MCP'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Content() {
  const handleAction = (action: string, content: Content) => {
    switch (action) {
      case 'view':
        toast.info(`Viewing: ${content.title}`);
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

  const handleGenerate = (data: { title: string; prompt: string }) => {
    toast.success(`MCP workflow started for: ${data.title}`, {
      description: 'Check the Dashboard for job status',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content</h1>
          <p className="text-muted-foreground mt-1">
            Manage your generated content
          </p>
        </div>
      </div>

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
            <GenerateDialog type="blog" onGenerate={handleGenerate} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockBlogs.map((blog) => (
              <ContentCard key={blog.id} content={blog} onAction={handleAction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-end">
            <GenerateDialog type="image" onGenerate={handleGenerate} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockImages.map((image) => (
              <ContentCard key={image.id} content={image} onAction={handleAction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockDrafts.length > 0 ? (
              mockDrafts.map((draft) => (
                <ContentCard key={draft.id} content={draft} onAction={handleAction} />
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No drafts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
