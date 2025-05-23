
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <Alert className="mb-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
      <AlertCircle className="h-4 w-4 text-amber-800 dark:text-amber-400" />
      <AlertTitle className="text-amber-800 dark:text-amber-400">Content Processing Required</AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-400 text-sm">
        <div className="flex flex-col gap-2">
          <p>
            {!hasReprocessedContent
              ? "TESTING: Raw response detected but no processed content available. Try processing the raw response to display content."
              : "TESTING: Content processed from raw response. Displaying best effort interpretation."}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            disabled={isProcessing}
            onClick={onProcessRawResponse}
            className="flex items-center gap-2 mt-2 self-start"
          >
            {isProcessing ? "Processing..." : "Process Raw Response"}
            {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
