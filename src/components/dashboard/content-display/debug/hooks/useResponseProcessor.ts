
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
      // Enhanced logging to debug processing
      console.log("TESTING - Processing raw response type:", typeof rawResponse);
      if (typeof rawResponse === 'object') {
        console.log("TESTING - Raw response keys:", Object.keys(rawResponse));
      }
      
      const processedRawResponse = preprocessRawResponse(rawResponse);
      console.log("TESTING - Processed raw response for display:", processedRawResponse);
      
      // Handle direct processing for display with better format detection
      let contentToDisplay: any[] = [];
      
      if (processedRawResponse) {
        // Case 1: Already an array of content items
        if (Array.isArray(processedRawResponse)) {
          contentToDisplay = processedRawResponse;
        }
        // Case 2: Single content item with expected AI content structure
        else if (typeof processedRawResponse === 'object' && (
          processedRawResponse.pillarContent !== undefined ||
          processedRawResponse.supportContent !== undefined ||
          processedRawResponse.socialMediaPosts !== undefined ||
          processedRawResponse.emailSeries !== undefined
        )) {
          contentToDisplay = [processedRawResponse];
        }
        // Case 3: Response with 'content' array
        else if (processedRawResponse.content && Array.isArray(processedRawResponse.content)) {
          contentToDisplay = processedRawResponse.content;
        }
        // Case 4: Raw string or unstructured object as fallback
        else {
          contentToDisplay = [{ 
            output: typeof rawResponse === 'string' ? 
              rawResponse : JSON.stringify(rawResponse, (key, value) => {
                // Handle circular references
                if (typeof value === 'object' && value !== null) {
                  if (value.message && value.message.startsWith('[Circular Reference')) {
                    return `[Circular Reference: ${value.message}]`;
                  }
                }
                return value;
              }, 2)
          }];
        }
      }
      
      console.log("TESTING - Final content to display:", contentToDisplay.length, "items");
      console.log("TESTING - Content details:", JSON.stringify(contentToDisplay).substring(0, 500));
      setReprocessedContent(contentToDisplay);
    } catch (error) {
      console.error("TESTING - Error processing raw response:", error);
      setProcessingError(error instanceof Error ? 
        error.message : "Unknown error processing response");
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-process raw response once on component mount or when raw response changes
  useEffect(() => {
    if (rawResponse && (!processedContent || processedContent.length === 0) && !isProcessing) {
      console.log("TESTING - Auto-processing raw response on mount or change");
      processRawResponse();
    }
  }, [rawResponse]);

  // Use processed content if available, otherwise use reprocessed content
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
