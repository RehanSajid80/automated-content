
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ProcessingNotificationProps {
  isProcessing: boolean;
  hasProcessedContent: boolean;
  hasReprocessedContent: boolean;
  onProcessRawResponse: () => void;
}

export const ProcessingNotification: React.FC<ProcessingNotificationProps> = ({
  isProcessing,
  hasProcessedContent,
  hasReprocessedContent,
  onProcessRawResponse
}) => {
  // If we already have processed content, don't show the notification
  if (hasProcessedContent) {
    return null;
  }
  
  return (
    <div className="mb-4 p-4 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
      <div className="flex justify-between items-center">
        <p className="text-amber-800 dark:text-amber-400 text-sm font-medium">
          {!hasReprocessedContent
            ? "No processed content available. Try processing the raw response."
            : "Content processed from raw response. Displaying best effort interpretation."}
        </p>
        
        <Button
          variant="outline"
          size="sm"
          disabled={isProcessing}
          onClick={onProcessRawResponse}
          className="flex items-center gap-2"
        >
          {isProcessing ? "Processing..." : "Process Raw Response"}
          {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
        </Button>
      </div>
    </div>
  );
};

