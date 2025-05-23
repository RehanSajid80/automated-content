
import React from "react";
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

  return (
    <div className="space-y-4">
      <ProcessingError error={processingError} />
      
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
