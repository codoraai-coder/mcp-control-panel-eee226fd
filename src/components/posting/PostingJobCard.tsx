import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostingJob } from "@/types/mcp";
import { PostingStatusBadge } from "./PostingStatusBadge";
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Image as ImageIcon 
} from "lucide-react";
import { toast } from "sonner";

interface PostingJobCardProps {
  job: PostingJob;
  onMarkPosted: (jobId: string) => Promise<unknown>;
  onMarkFailed: (jobId: string, message?: string) => Promise<unknown>;
  onRetry: (jobId: string) => Promise<unknown>;
  isLoading?: boolean;
}

export function PostingJobCard({ 
  job, 
  onMarkPosted, 
  onMarkFailed, 
  onRetry,
  isLoading 
}: PostingJobCardProps) {
  const [copied, setCopied] = useState(false);
  const { prepared_payload: payload } = job;
  
  const charCount = payload.post_text.length;
  const maxChars = payload.formatting_hints.max_length;
  const isOverLimit = charCount > maxChars;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload.post_text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleOpenX = () => {
    window.open("https://x.com/compose/post", "_blank");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm">𝕏</span>
            </div>
            <div>
              <p className="text-sm font-medium">X (Twitter) Post</p>
              <p className="text-xs text-muted-foreground">
                Created {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <PostingStatusBadge status={job.status} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Post Content Preview */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <p className="text-sm whitespace-pre-wrap">{payload.post_text}</p>
          
          {payload.image_url && (
            <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden bg-muted">
              <img
                src={payload.image_url}
                alt="Post attachment"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80" style={{ display: "none" }}>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          )}
          
          {payload.hashtags && payload.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {payload.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Character Count */}
        <div className="flex items-center justify-between text-sm">
          <span className={isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}>
            {charCount} / {maxChars} characters
          </span>
          {isOverLimit && (
            <span className="text-destructive text-xs">
              ⚠️ Over limit by {charCount - maxChars}
            </span>
          )}
        </div>

        {/* Error Message */}
        {job.error_message && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{job.error_message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {job.status === "ready" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={isLoading}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Text
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenX}
                disabled={isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open X
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => onMarkPosted(job.id)}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark as Posted
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onMarkFailed(job.id)}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Failed
              </Button>
            </>
          )}
          
          {job.status === "failed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetry(job.id)}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          )}
          
          {job.status === "posted" && job.posted_at && (
            <p className="text-sm text-muted-foreground">
              Posted on {new Date(job.posted_at).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
