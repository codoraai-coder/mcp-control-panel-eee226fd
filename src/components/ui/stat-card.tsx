import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatCardVariant = 'default' | 'emerald' | 'teal' | 'forest' | 'amber';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: StatCardVariant;
  className?: string;
}

const variantStyles: Record<StatCardVariant, {
  card: string;
  title: string;
  value: string;
  description: string;
  trend: { up: string; down: string; neutral: string };
  iconWrapper: string;
  icon: string;
}> = {
  default: {
    card: "bg-card border-border hover:shadow-md",
    title: "text-muted-foreground",
    value: "text-card-foreground",
    description: "text-muted-foreground",
    trend: {
      up: "text-success",
      down: "text-destructive",
      neutral: "text-muted-foreground"
    },
    iconWrapper: "bg-primary/10",
    icon: "text-primary"
  },
  emerald: {
    card: "gradient-emerald border-transparent shadow-emerald-glow hover:shadow-lg",
    title: "text-white/80",
    value: "text-white",
    description: "text-white/70",
    trend: {
      up: "text-white/90",
      down: "text-white/90",
      neutral: "text-white/70"
    },
    iconWrapper: "bg-white/20",
    icon: "text-white"
  },
  teal: {
    card: "gradient-teal border-transparent shadow-teal-glow hover:shadow-lg",
    title: "text-white/80",
    value: "text-white",
    description: "text-white/70",
    trend: {
      up: "text-white/90",
      down: "text-white/90",
      neutral: "text-white/70"
    },
    iconWrapper: "bg-white/20",
    icon: "text-white"
  },
  forest: {
    card: "gradient-forest border-transparent shadow-emerald-glow hover:shadow-lg",
    title: "text-white/80",
    value: "text-white",
    description: "text-white/70",
    trend: {
      up: "text-white/90",
      down: "text-white/90",
      neutral: "text-white/70"
    },
    iconWrapper: "bg-white/20",
    icon: "text-white"
  },
  amber: {
    card: "gradient-amber border-transparent hover:shadow-lg",
    title: "text-white/80",
    value: "text-white",
    description: "text-white/70",
    trend: {
      up: "text-white/90",
      down: "text-white/90",
      neutral: "text-white/70"
    },
    iconWrapper: "bg-white/20",
    icon: "text-white"
  }
};

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <div className={cn(
      "rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1",
      styles.card,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", styles.title)}>{title}</p>
          <p className={cn("text-3xl font-bold", styles.value)}>{value}</p>
          {description && (
            <p className={cn("text-xs", styles.description)}>{description}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              styles.trend[trend.direction]
            )}>
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.value}% from last week
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            styles.iconWrapper
          )}>
            <Icon className={cn("h-5 w-5", styles.icon)} />
          </div>
        )}
      </div>
    </div>
  );
}
