
import { preprocessRawResponse } from "@/components/dashboard/content-display/debug/utils/responseProcessingUtils";

/**
 * Process AI response for content generation
 */
export const processAIResponse = (responseData: any): any[] => {
  console.log("Processing AI response:", responseData);
  
  try {
    // Use the preprocessing utility to handle the response
    const processedResponse = preprocessRawResponse(responseData);
    
    console.log("Processed AI response:", processedResponse);
    
    // Ensure we return an array
    if (Array.isArray(processedResponse)) {
      return processedResponse;
    } else if (processedResponse) {
      return [processedResponse];
    }
    
    return [];
  } catch (error) {
    console.error("Error processing AI response:", error);
    
    // Fallback: try to extract content from various formats
    if (Array.isArray(responseData) && responseData.length > 0) {
      return responseData;
    } else if (responseData?.output) {
      return [{ output: responseData.output }];
    } else if (typeof responseData === 'string') {
      return [{ output: responseData }];
    }
    
    return [];
  }
};
