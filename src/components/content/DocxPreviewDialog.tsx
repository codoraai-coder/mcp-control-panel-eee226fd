import { useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocxPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  docxUrl: string;
}

export function DocxPreviewDialog({ 
  open, 
  onOpenChange, 
  title, 
  docxUrl 
}: DocxPreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(docxUrl)}&embedded=true`;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="truncate">{title}</span>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="ml-2"
            >
              <a href={docxUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Download
              </a>
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative bg-muted rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
            </div>
          )}
          
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">Unable to preview document</p>
              <Button asChild>
                <a href={docxUrl} target="_blank" rel="noopener noreferrer">
                  Download DOCX
                </a>
              </Button>
            </div>
          ) : (
            <iframe
              src={googleViewerUrl}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title={`Preview: ${title}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
