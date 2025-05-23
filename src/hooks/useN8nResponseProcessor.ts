
/**
 * This hook handles processing of n8n webhook responses
 */
export const useN8nResponseProcessor = () => {
  /**
   * Process the response from the n8n webhook
   * Handles various response formats and normalizes them
   */
  const processResponse = (responseText: string) => {
    console.log("Processing n8n response:", responseText?.substring(0, 200) + "...");
    
    let data;
    try {
      // Try to parse as JSON first
      data = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
      console.log("Parsed webhook response data:", data);
    } catch (parseError) {
      console.log("Response is not valid JSON, treating as raw content");
      // If the response is not JSON, create a structured object with the raw text
      data = {
        content: [{ output: responseText }]
      };
    }
    
    // Handle empty array responses
    if (Array.isArray(data) && data.length === 0) {
      console.log("Received empty array response");
      return {
        suggestions: [],
        content: [],
        title: "",
        rawResponse: responseText
      };
    }
    
    // Direct format detection for AI Content Suggestions format
    if (isAIContentSuggestionsFormat(data)) {
      console.log("Detected AI Content Suggestions format directly");
      const formattedContent = formatAIContentSuggestions(data);
      console.log("Formatted AI content suggestions:", formattedContent);
      
      return {
        suggestions: [],
        content: formattedContent,
        title: Array.isArray(data) && data[0]?.title || data?.title || "",
        rawResponse: responseText
      };
    }
    
    // Initialize result containers
    let suggestions: any[] = [];
    let contentArray: any[] = [];
    let title = "";
    
    // Handle suggestions if they exist
    if (data && data.suggestions) {
      console.log("Found suggestions in response:", data.suggestions);
      suggestions = Array.isArray(data.suggestions) ? data.suggestions : [data.suggestions];
    }
    
    // Extract title if it exists
    if (data && data.title) {
      console.log("Found title in response:", data.title);
      title = data.title;
    }
    
    // Handle AI Content Suggestions specific format (as an array of objects)
    if (Array.isArray(data) && data.length > 0) {
      console.log("Processing array of content items:", data.length);
      
      // Direct check for AI Content Suggestions format
      const firstItem = data[0];
      if (firstItem && (firstItem.pillarContent || firstItem.supportContent || 
                        firstItem.socialMediaPosts || firstItem.emailSeries)) {
        console.log("Found AI Content Suggestions in array format");
        contentArray = data;
        return {
          suggestions,
          content: contentArray,
          title,
          rawResponse: responseText
        };
      }
      
      // If not AI Content Suggestions format, use standard processing
      contentArray = data.map(item => {
        return {
          ...item,
          title: item.title || "",
          output: item.output || item.content || JSON.stringify(item)
        };
      });
      
      console.log("Processed array items:", contentArray.length);
    }
    // Check for AI Content Suggestions specific format (single object)
    else if (data && (data.pillarContent || data.supportContent || 
                     data.socialMediaPosts || data.emailSeries || 
                     data.reasoning)) {
      console.log("Found AI Content Suggestions format as single object");
      
      // Just pass through the content directly
      contentArray = [data];
      
      console.log("Processed AI Content Suggestions object:", contentArray);
    }
    // Check for new format with specific content sections
    else if (data && (data.pillarContent || data.supportContent || 
                     data.metaTags || data.socialPosts || data.emailCampaign)) {
      console.log("Found structured content with specific sections");
      
      // Combine sections into a single output
      contentArray = [data];
    }
    // Handle standard content formats
    else if (data) {
      if (data.output) {
        console.log("Found output property in response");
        contentArray = [{ output: data.output, title: data.title || "" }];
      } else if (data.content) {
        console.log("Found content property in response");
        contentArray = Array.isArray(data.content) 
          ? data.content.map(item => ({ ...item, title: item.title || data.title || "" }))
          : [{ output: data.content, title: data.title || "" }];
      } else if (typeof data === "string") {
        console.log("Response is a string, using as output");
        contentArray = [{ output: data, title: "" }];
      } else if (data.results) {
        console.log("Found results property in response");
        contentArray = Array.isArray(data.results) 
          ? data.results.map(item => ({ ...item, title: item.title || data.title || "" }))
          : [{ output: data.results, title: data.title || "" }];
      } else if (data.text) {
        console.log("Found text property in response");
        contentArray = [{ output: data.text, title: data.title || "" }];
      } else if (data.data) {
        console.log("Found data property in response");
        const content = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
        contentArray = [{ output: content, title: data.title || "" }];
      } else if (Object.keys(data).length > 0) {
        // As a last resort, use the entire response directly
        console.log("No standard content structure found, using response directly");
        contentArray = [data];
      } else {
        console.log("Empty data object, returning empty content");
        contentArray = [];
      }
    }
    
    return {
      suggestions,
      content: contentArray,
      title,
      rawResponse: responseText
    };
  };
  
  // Helper function to check if the response is in AI Content Suggestions format
  const isAIContentSuggestionsFormat = (data: any): boolean => {
    if (!data) return false;
    
    // Enhanced logging for format detection
    console.log("Checking AI Content Suggestions format for:", 
      Array.isArray(data) ? "Array" : typeof data);
    
    // Check array format
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      const isAIFormat = Boolean(firstItem && 
        (firstItem.pillarContent || firstItem.supportContent || 
         firstItem.socialMediaPosts || firstItem.emailSeries || 
         firstItem.reasoning));
      
      console.log("Array format check result:", isAIFormat);
      if (isAIFormat) {
        console.log("AI Content Suggestion format detected in array format");
      }
      return isAIFormat;
    }
    
    // Check single object format
    const isObjectFormat = Boolean(data && 
      (data.pillarContent !== undefined || data.supportContent !== undefined || 
       data.socialMediaPosts !== undefined || data.emailSeries !== undefined || 
       data.reasoning !== undefined));
    
    console.log("Object format check result:", isObjectFormat);
    if (isObjectFormat) {
      console.log("AI Content Suggestion format detected in object format");
    }
    return isObjectFormat;
  };
  
  // Helper function to format AI Content Suggestions consistently
  const formatAIContentSuggestions = (data: any): any[] => {
    if (Array.isArray(data)) {
      console.log("Formatting array of AI Content Suggestions");
      return data.map(item => normalizeContentItem(item));
    } else {
      console.log("Formatting single AI Content Suggestion object");
      return [normalizeContentItem(data)];
    }
  };
  
  // Normalize content item structure for consistent processing
  const normalizeContentItem = (item: any): any => {
    // Clone the item to avoid mutation
    const normalizedItem = { ...item };
    
    // Handle nested pillarContent structure
    if (normalizedItem.pillarContent && typeof normalizedItem.pillarContent === 'object') {
      if (normalizedItem.pillarContent.content) {
        normalizedItem.pillarContent = normalizedItem.pillarContent.content;
      } else if (normalizedItem.pillarContent.title && !normalizedItem.title) {
        // Use pillarContent title as item title if no title exists
        normalizedItem.title = normalizedItem.pillarContent.title;
      }
    }
    
    // Handle nested supportContent structure
    if (normalizedItem.supportContent && typeof normalizedItem.supportContent === 'object') {
      if (normalizedItem.supportContent.content) {
        normalizedItem.supportContent = normalizedItem.supportContent.content;
      }
    }
    
    return normalizedItem;
  };
  
  return {
    processResponse
  };
};
