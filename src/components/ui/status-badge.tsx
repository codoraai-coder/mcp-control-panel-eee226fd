import { cn } from "@/lib/utils";
import type { ContentStatus, JobStatus } from "@/types/mcp";

interface StatusBadgeProps {
  status: ContentStatus | JobStatus;
  className?: string;
}

const statusConfig = {
  // Content statuses
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  approved: { label: 'Approved', className: 'bg-info/20 text-info' },
  used: { label: 'Used', className: 'bg-accent/20 text-accent' },
  posted: { label: 'Posted', className: 'bg-success/20 text-success' },
  
  // Job statuses
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', className: 'bg-warning/20 text-warning animate-pulse' },
  completed: { label: 'Completed', className: 'bg-success/20 text-success' },
  failed: { label: 'Failed', className: 'bg-destructive/20 text-destructive' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      {status === 'running' && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
