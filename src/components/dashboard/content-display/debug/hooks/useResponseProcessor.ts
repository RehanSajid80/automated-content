
import { useState, useEffect } from "react";
import { preprocessRawResponse } from "../utils/responseProcessingUtils";

/**
 * Hook for processing raw API responses
 */
export const useResponseProcessor = (rawResponse: any, processedContent: any[]) => {
  const [reprocessedContent, setReprocessedContent] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Manually process the raw response
  const processRawResponse = () => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const processedRawResponse = preprocessRawResponse(rawResponse);
      console.log("Processed raw response for display:", processedRawResponse);
      
      // Handle direct processing for display
      const contentToDisplay = processedRawResponse ? (
        Array.isArray(processedRawResponse) ? processedRawResponse : 
        // If not an array but has AI content structure, wrap in array
        (processedRawResponse && (
          processedRawResponse.pillarContent !== undefined ||
          processedRawResponse.supportContent !== undefined ||
          processedRawResponse.socialMediaPosts !== undefined ||
          processedRawResponse.emailSeries !== undefined
        )) ? [processedRawResponse] :
        // Last resort - wrap rawResponse in array
        [{ output: typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse) }]
      ) : [];
      
      console.log("Content to display:", contentToDisplay);
      setReprocessedContent(contentToDisplay);
    } catch (error) {
      console.error("Error processing raw response:", error);
      setProcessingError(error instanceof Error ? error.message : "Unknown error processing response");
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-process raw response once on component mount
  useEffect(() => {
    if (rawResponse && (!processedContent || processedContent.length === 0)) {
      console.log("Auto-processing raw response on mount");
      processRawResponse();
    }
  }, [rawResponse, processedContent]);

  const contentToDisplay = processedContent?.length > 0 ? processedContent : 
                          reprocessedContent?.length > 0 ? reprocessedContent : [];

  return {
    reprocessedContent,
    isProcessing,
    processingError,
    processRawResponse,
    contentToDisplay
  };
};

