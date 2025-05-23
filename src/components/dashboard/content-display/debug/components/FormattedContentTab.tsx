
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
  return (
    <div className="space-y-4">
      <ProcessingError error={processingError} />
      
      {((!processedContent || processedContent.length === 0) && rawResponse) && (
        <ProcessingNotification
          isProcessing={isProcessing}
          hasProcessedContent={processedContent && processedContent.length > 0}
          hasReprocessedContent={reprocessedContent.length > 0}
          onProcessRawResponse={onProcessRawResponse}
        />
      )}
      
      <FormattedContent processedContent={contentToDisplay} />
    </div>
  );
};

