import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Image, X, Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { GenerationJob } from '@/contexts/GenerationJobsContext';
import { formatDistanceToNow } from 'date-fns';

interface GenerationJobCardProps {
  job: GenerationJob;
  onCancel: (jobId: string) => void;
  onClear: (jobId: string) => void;
  onAddContent?: (job: GenerationJob) => void;
}

export function GenerationJobCard({ job, onCancel, onClear, onAddContent }: GenerationJobCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedProgress, setEstimatedProgress] = useState(0);

  const isActive = job.status === 'pending' || job.status === 'generating';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  // Estimate progress based on elapsed time
  // Blog: ~5-10 min, Image: ~1-2 min
  const estimatedDuration = job.type === 'blog' ? 7 * 60 : 90; // seconds

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - job.startedAt.getTime()) / 1000);
      setElapsedTime(elapsed);
      
      // Asymptotic progress that never reaches 100%
      const progress = Math.min(95, (elapsed / estimatedDuration) * 100);
      setEstimatedProgress(progress);
    }, 1000);

    return () => clearInterval(interval);
  }, [job.startedAt, isActive, estimatedDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusMessage = () => {
    if (isCompleted) return 'Ready!';
    if (isFailed) return job.error || 'Failed';
    
    if (job.type === 'blog') {
      if (elapsedTime < 60) return 'Researching topic...';
      if (elapsedTime < 180) return 'Writing content...';
      if (elapsedTime < 300) return 'Generating cover image...';
      return 'Finalizing...';
    } else {
      if (elapsedTime < 30) return 'Creating quote...';
      if (elapsedTime < 60) return 'Generating image...';
      return 'Finalizing...';
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${
      isCompleted ? 'border-green-500/50 bg-green-500/5' : 
      isFailed ? 'border-destructive/50 bg-destructive/5' : 
      'border-primary/30 bg-primary/5'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${
            isCompleted ? 'bg-green-500/20' : 
            isFailed ? 'bg-destructive/20' : 
            'bg-primary/20'
          }`}>
            {job.type === 'blog' ? (
              <FileText className={`h-5 w-5 ${
                isCompleted ? 'text-green-500' : 
                isFailed ? 'text-destructive' : 
                'text-primary'
              }`} />
            ) : (
              <Image className={`h-5 w-5 ${
                isCompleted ? 'text-green-500' : 
                isFailed ? 'text-destructive' : 
                'text-primary'
              }`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {job.type === 'blog' ? 'Blog Post' : 'Motivational Image'}
              </span>
              {isActive && (
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              )}
              {isCompleted && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {isFailed && (
                <AlertCircle className="h-3 w-3 text-destructive" />
              )}
            </div>
            
            <p className="font-medium truncate mt-0.5">"{job.topic}"</p>
            
            <p className="text-sm text-muted-foreground mt-1">
              {getStatusMessage()}
            </p>

            {/* Progress bar for active jobs */}
            {isActive && (
              <div className="mt-3 space-y-1">
                <Progress value={estimatedProgress} className="h-1.5" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(elapsedTime)}
                  </span>
                  <span>
                    ~{formatTime(Math.max(0, estimatedDuration - elapsedTime))} remaining
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              {isActive && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCancel(job.id)}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              )}
              
              {isCompleted && onAddContent && (
                <Button 
                  size="sm"
                  onClick={() => onAddContent(job)}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Add to Content
                </Button>
              )}
              
              {(isCompleted || isFailed) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onClear(job.id)}
                  className="text-xs"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>

          {/* Elapsed time badge */}
          {isActive && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Started {formatDistanceToNow(job.startedAt, { addSuffix: true })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
