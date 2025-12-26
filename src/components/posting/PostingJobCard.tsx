import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PostingJob } from "@/types/mcp";
import { PostingStatusBadge } from "./PostingStatusBadge";
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Image as ImageIcon,
  CalendarClock,
  Clock,
  X
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PostingJobCardProps {
  job: PostingJob;
  onMarkPosted: (jobId: string) => Promise<unknown>;
  onMarkFailed: (jobId: string, message?: string) => Promise<unknown>;
  onRetry: (jobId: string) => Promise<unknown>;
  onSchedule?: (jobId: string, scheduledFor: Date) => Promise<unknown>;
  onCancelSchedule?: (jobId: string) => Promise<unknown>;
  isLoading?: boolean;
}

export function PostingJobCard({ 
  job, 
  onMarkPosted, 
  onMarkFailed, 
  onRetry,
  onSchedule,
  onCancelSchedule,
  isLoading 
}: PostingJobCardProps) {
  const [copied, setCopied] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    job.scheduled_for ? new Date(job.scheduled_for) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    job.scheduled_for 
      ? format(new Date(job.scheduled_for), "HH:mm") 
      : format(new Date(), "HH:mm")
  );
  
  const { prepared_payload: payload } = job;
  
  // Defensive checks for potentially missing fields
  if (!payload) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Invalid job data</p>
        </CardContent>
      </Card>
    );
  }

  // Provide defaults for potentially missing fields
  const formattingHints = payload.formatting_hints ?? {
    max_length: 280,
    supports_markdown: false,
    supports_images: true,
    supports_videos: true,
  };

  const postText = payload.post_text ?? "";
  const charCount = postText.length;
  const maxChars = formattingHints.max_length;
  const isOverLimit = charCount > maxChars;

  const isScheduled = !!job.scheduled_for;
  const scheduledDate = job.scheduled_for ? new Date(job.scheduled_for) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postText);
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

  const handleSchedule = async () => {
    if (!selectedDate || !onSchedule) return;
    
    // Combine date and time
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    // Validate future date
    if (scheduledDateTime <= new Date()) {
      toast.error("Please select a future date and time");
      return;
    }
    
    try {
      await onSchedule(job.id, scheduledDateTime);
      setScheduleOpen(false);
      toast.success("Post scheduled!", {
        description: `Scheduled for ${format(scheduledDateTime, "PPP 'at' p")}`,
      });
    } catch {
      toast.error("Failed to schedule post");
    }
  };

  const handleCancelSchedule = async () => {
    if (!onCancelSchedule) return;
    try {
      await onCancelSchedule(job.id);
      setSelectedDate(undefined);
      toast.success("Schedule cancelled");
    } catch {
      toast.error("Failed to cancel schedule");
    }
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
        {/* Scheduled Banner */}
        {isScheduled && scheduledDate && job.status === "ready" && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Scheduled for {format(scheduledDate, "PPP 'at' p")}
              </span>
            </div>
            {onCancelSchedule && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-primary hover:text-primary"
                onClick={handleCancelSchedule}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Post Content Preview */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <p className="text-sm whitespace-pre-wrap">{postText}</p>
          
          {payload?.image_url && (
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
          
          {payload?.hashtags && payload.hashtags.length > 0 && (
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

              {/* Schedule Button */}
              {onSchedule && (
                <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <CalendarClock className="h-4 w-4 mr-1" />
                      {isScheduled ? "Reschedule" : "Schedule"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Select Time
                        </Label>
                        <Input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={handleSchedule}
                          disabled={!selectedDate || isLoading}
                        >
                          <CalendarClock className="h-4 w-4 mr-1" />
                          Schedule Post
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setScheduleOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              
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
