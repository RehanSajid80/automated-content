
import React, { useEffect } from "react";
import { FormattedContent } from "./FormattedContent";
import { ProcessingError } from "./ProcessingError";
import { ProcessingNotification } from "./ProcessingNotification";

interface FormattedContentTabProps {
  processingError: string | null;
  processedContent: any[];
  reprocessedContent: any[];
  rawResponse: any;
  isProcessing: boolean;
  onProcessRawResponse: () => void;
  contentToDisplay: any[];
}

export const FormattedContentTab: React.FC<FormattedContentTabProps> = ({
  processingError,
  processedContent,
  reprocessedContent,
  rawResponse,
  isProcessing,
  onProcessRawResponse,
  contentToDisplay
}) => {
  const hasValidRawResponse = Boolean(rawResponse && 
    (typeof rawResponse === 'object' || 
     (typeof rawResponse === 'string' && rawResponse.trim().length > 0)));

  // Auto-process raw response if we have it but no processed content
  useEffect(() => {
    if (hasValidRawResponse && (!processedContent || processedContent.length === 0) && 
        (!reprocessedContent || reprocessedContent.length === 0) && !isProcessing) {
      console.log("TESTING - Auto processing raw response in FormattedContentTab");
      onProcessRawResponse();
    }
  }, [hasValidRawResponse, processedContent, reprocessedContent, isProcessing]);

  return (
    <div className="space-y-4">
      <ProcessingError error={processingError} details={processingError ? JSON.stringify(rawResponse, null, 2) : undefined} />
      
      {/* Show processing notification when we have a raw response but no processed content */}
      {hasValidRawResponse && (!processedContent || processedContent.length === 0) && (
        <ProcessingNotification
          isProcessing={isProcessing}
          hasProcessedContent={Boolean(processedContent && processedContent.length > 0)}
          hasReprocessedContent={Boolean(reprocessedContent && reprocessedContent.length > 0)}
          onProcessRawResponse={onProcessRawResponse}
        />
      )}
      
      {/* Show formatted content if available */}
      <FormattedContent processedContent={contentToDisplay} />
    </div>
  );
};
