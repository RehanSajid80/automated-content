
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RotateCwIcon } from "lucide-react";
import { toast } from "sonner";

interface ContentRefreshManagerProps {
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  lastRefreshed?: string;
}

/**
 * A component that manages content refresh operations with debouncing
 * to prevent excessive refreshes and provide user feedback
 */
const ContentRefreshManager: React.FC<ContentRefreshManagerProps> = ({
  isRefreshing,
  onRefresh,
  lastRefreshed
}) => {
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
  const [timeSinceRefresh, setTimeSinceRefresh] = useState<string | null>(null);

  // Handle the refresh with debouncing
  const handleRefresh = async () => {
    if (isRefreshDisabled || isRefreshing) return;
    
    // Disable the refresh button temporarily to prevent rapid clicking
    setIsRefreshDisabled(true);
    
    try {
      await onRefresh();
      toast.success("Content refreshed successfully");
    } catch (error) {
      console.error("Error refreshing content:", error);
      toast.error("Failed to refresh content");
    } finally {
      // Re-enable the refresh button after a delay
      setTimeout(() => {
        setIsRefreshDisabled(false);
      }, 2000); // 2 second cooldown
    }
  };

  // Update the time since last refresh
  useEffect(() => {
    if (!lastRefreshed) return;
    
    const updateTimeSinceRefresh = () => {
      const lastRefreshedDate = new Date(lastRefreshed);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastRefreshedDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        setTimeSinceRefresh("just now");
      } else if (diffInMinutes === 1) {
        setTimeSinceRefresh("1 minute ago");
      } else if (diffInMinutes < 60) {
        setTimeSinceRefresh(`${diffInMinutes} minutes ago`);
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        setTimeSinceRefresh(`${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`);
      }
    };
    
    updateTimeSinceRefresh();
    const interval = setInterval(updateTimeSinceRefresh, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshDisabled || isRefreshing}
        className="flex items-center gap-1.5"
      >
        <RotateCwIcon size={14} className={isRefreshing ? "animate-spin" : ""} />
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </Button>
      {timeSinceRefresh && (
        <span className="text-xs text-muted-foreground">
          Last updated: {timeSinceRefresh}
        </span>
      )}
    </div>
  );
};

export default ContentRefreshManager;
