import { useState } from "react";
import { FileText, Image, MessageSquare, Hash, Sparkles, Download, Copy, Check, BookmarkPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Content } from "@/types/mcp";
import { DocxPreviewDialog } from "./DocxPreviewDialog";

interface ContentResultCardProps {
  content: Content;
  onSaveToLibrary?: (contentId: string) => Promise<void>;
  isSaving?: boolean;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  blog: <FileText className="h-4 w-4" />,
  blog_post: <FileText className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  caption: <MessageSquare className="h-4 w-4" />,
  hashtags: <Hash className="h-4 w-4" />,
  optimized_content: <Sparkles className="h-4 w-4" />,
};

const contentTypeLabels: Record<string, string> = {
  blog: "Blog Post",
  blog_post: "Blog Post",
  image: "Motivational Image",
  caption: "Caption",
  hashtags: "Hashtags",
  optimized_content: "Optimized Content",
};

export function ContentResultCard({ content, onSaveToLibrary, isSaving }: ContentResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [docxPreviewOpen, setDocxPreviewOpen] = useState(false);
  
  const contentType = content.content_type || content.type || 'blog';
  const icon = contentTypeIcons[contentType] || <FileText className="h-4 w-4" />;
  const label = contentTypeLabels[contentType] || contentType;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const docxUrl = content.docxUrl || content.data?.docx_url as string;
  const coverUrl = content.coverUrl || content.data?.cover_url as string;
  const imageUrl = content.imageUrl || content.s3Url || content.data?.image_url as string;
  const quoteText = content.quoteText || content.data?.quote_text as string;
  const captionText = content.data?.caption as string;
  const hashtags = content.data?.hashtags as string[];
  const optimizedText = content.data?.optimized as string;
  const topic = content.data?.topic as string;

  const isSaved = content.status === 'approved' || content.status === 'used' || content.status === 'posted';

  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <p className="font-medium text-sm">{content.title || label}</p>
            <p className="text-xs text-muted-foreground">
              {topic && `Topic: ${topic}`}
              {!topic && label}
            </p>
          </div>
        </div>
        <StatusBadge status={content.status} />
      </div>

      {/* Content Preview based on type */}
      {(contentType === 'blog' || contentType === 'blog_post') && (
        <div className="space-y-3">
          {coverUrl && (
            <img 
              src={coverUrl} 
              alt="Blog cover" 
              className="w-full h-32 object-cover rounded-md"
            />
          )}
          <div className="flex flex-wrap gap-2">
            {docxUrl && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setDocxPreviewOpen(true)}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownload(docxUrl, `${content.title || 'blog'}.docx`)}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download DOCX
                </Button>
              </>
            )}
          </div>
          {docxUrl && (
            <DocxPreviewDialog
              open={docxPreviewOpen}
              onOpenChange={setDocxPreviewOpen}
              title={content.title || "Blog Preview"}
              docxUrl={docxUrl}
            />
          )}
        </div>
      )}

      {contentType === 'image' && (
        <div className="space-y-3">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={quoteText || "Generated image"} 
              className="w-full h-40 object-cover rounded-md"
            />
          )}
          {quoteText && (
            <p className="text-sm text-muted-foreground italic">"{quoteText}"</p>
          )}
          <div className="flex flex-wrap gap-2">
            {imageUrl && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Full
              </Button>
            )}
            {quoteText && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCopy(quoteText)}
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                Copy Quote
              </Button>
            )}
          </div>
        </div>
      )}

      {contentType === 'caption' && captionText && (
        <div className="space-y-3">
          <p className="text-sm bg-muted/50 p-3 rounded-md">{captionText}</p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleCopy(captionText)}
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            Copy Caption
          </Button>
        </div>
      )}

      {contentType === 'hashtags' && hashtags && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag, i) => (
              <span 
                key={i} 
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleCopy(hashtags.join(' '))}
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            Copy All
          </Button>
        </div>
      )}

      {contentType === 'optimized_content' && optimizedText && (
        <div className="space-y-3">
          <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{optimizedText}</p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleCopy(optimizedText)}
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            Copy
          </Button>
        </div>
      )}

      {/* Save to Library button */}
      {onSaveToLibrary && !isSaved && (
        <div className="pt-2 border-t border-border">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSaveToLibrary(content.id)}
            disabled={isSaving}
            className="w-full"
          >
            <BookmarkPlus className="h-3.5 w-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : 'Save to Library'}
          </Button>
        </div>
      )}

      {isSaved && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            ✓ Saved to Content Library
          </p>
        </div>
      )}
    </div>
  );
}