
import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  delay?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  delay = "animation-delay-100",
}) => {
  return (
    <div 
      className={cn(
        "rounded-xl bg-card border border-border p-5 animate-scale-in shadow-sm hover:shadow-md transition-shadow",
        delay,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {icon && <div className="text-primary/80">{icon}</div>}
      </div>
      
      {trend && trendValue && (
        <div className="mt-3">
          <div className={cn(
            "text-xs font-medium inline-flex items-center px-2 py-1 rounded-full",
            trend === "up" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", 
            trend === "neutral" && "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
          )}>
            {trend === "up" && "↑ "}
            {trend === "down" && "↓ "}
            {trendValue}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
