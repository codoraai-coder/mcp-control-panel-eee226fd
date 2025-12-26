import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostingJob } from "@/types/mcp";
import { Copy, ExternalLink, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface XPostComposerProps {
  job: PostingJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPosted: () => void;
  onFailed: (message: string) => void;
}

export function XPostComposer({ 
  job, 
  open, 
  onOpenChange, 
  onPosted, 
  onFailed 
}: XPostComposerProps) {
  const [step, setStep] = useState<"preview" | "confirm">("preview");
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

  const handleClose = () => {
    setStep("preview");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-xs">𝕏</span>
            </div>
            Post to X (Twitter)
          </DialogTitle>
          <DialogDescription>
            Copy the content below and post it manually on X
          </DialogDescription>
        </DialogHeader>

        {step === "preview" && (
          <div className="space-y-4">
            {/* Post Preview */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <textarea
                value={payload.post_text}
                readOnly
                rows={6}
                className="w-full bg-transparent resize-none text-sm focus:outline-none"
              />
              
              <div className={`text-right text-xs mt-2 ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {charCount}/{maxChars}
              </div>
              
              {payload.image_url && (
                <div className="mt-3">
                  <img
                    src={payload.image_url}
                    alt="Attachment"
                    className="rounded-lg max-h-40 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-sm mb-2">Steps to Post:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Click "Copy Text" to copy the post content</li>
                <li>Click "Open X" to go to X.com</li>
                <li>Paste the text and add any images</li>
                <li>Click "Post" on X</li>
                <li>Return here and confirm</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="flex-1" onClick={handleOpenX}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open X
              </Button>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setStep("confirm")}>
                I Posted It ✓
              </Button>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h4 className="font-medium mb-2">Confirm Posting Status</h4>
              <p className="text-sm text-muted-foreground">
                Did you successfully post to X?
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => {
                  onPosted();
                  handleClose();
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Yes, Posted Successfully
              </Button>
              
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => {
                  onFailed("User reported posting failed");
                  handleClose();
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                No, It Failed
              </Button>
            </div>

            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setStep("preview")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Preview
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
