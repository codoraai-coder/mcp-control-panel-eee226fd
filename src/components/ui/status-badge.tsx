import { cn } from "@/lib/utils";
import type { ContentStatus, JobStatus } from "@/types/mcp";

interface StatusBadgeProps {
  status: ContentStatus | JobStatus;
  className?: string;
}

const statusConfig = {
  // Content statuses
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  approved: { label: 'Approved', className: 'bg-primary/15 text-primary border border-primary/20' },
  used: { label: 'Used', className: 'bg-accent/15 text-accent border border-accent/20' },
  posted: { label: 'Posted', className: 'bg-success/15 text-success border border-success/20' },
  
  // Job statuses
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', className: 'bg-accent/15 text-accent border border-accent/20' },
  completed: { label: 'Completed', className: 'bg-success/15 text-success border border-success/20' },
  failed: { label: 'Failed', className: 'bg-destructive/15 text-destructive border border-destructive/20' },
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
