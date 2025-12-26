import { Badge } from "@/components/ui/badge";
import { PostingStatus } from "@/types/mcp";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface PostingStatusBadgeProps {
  status: PostingStatus;
}

const statusConfig: Record<PostingStatus, { 
  label: string; 
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ReactNode;
}> = {
  ready: { 
    label: "Ready to Post", 
    variant: "default",
    icon: <Clock className="h-3 w-3" />,
  },
  awaiting_user: { 
    label: "Awaiting User", 
    variant: "secondary",
    icon: <Loader2 className="h-3 w-3" />,
  },
  posted: { 
    label: "Posted", 
    variant: "outline",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  failed: { 
    label: "Failed", 
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

export function PostingStatusBadge({ status }: PostingStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
}
