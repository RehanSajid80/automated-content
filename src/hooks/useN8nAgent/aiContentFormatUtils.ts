
/**
 * Utilities for detecting and formatting AI Content Suggestions format
 */

// Helper function to check if the response is in AI Content Suggestions format
export const isAIContentSuggestionsFormat = (data: any): boolean => {
  if (!data) return false;
  
  console.log("Checking if response is in AI Content Suggestions format", data);
  
  // Check array format
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    return Boolean(firstItem && 
      (firstItem.pillarContent || firstItem.supportContent || 
       firstItem.socialMediaPosts || firstItem.emailSeries));
  }
  
  // Check single object format
  return Boolean(data && 
    (data.pillarContent || data.supportContent || 
     data.socialMediaPosts || data.emailSeries));
};

// Helper function to format AI Content Suggestions consistently
export const formatAIContentSuggestions = (data: any): any[] => {
  console.log("Formatting AI Content Suggestions", data);
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      topicArea: item.title || item.topicArea || "Content Suggestions",
      pillarContent: typeof item.pillarContent === 'string' ? [item.pillarContent] : item.pillarContent || [],
      supportContent: typeof item.supportContent === 'string' ? [item.supportContent] : item.supportContent || [],
      supportPages: typeof item.supportContent === 'string' ? [item.supportContent] : item.supportContent || [],
      metaTags: item.metaTags || [],
      socialMedia: item.socialMediaPosts || [],
      socialMediaPosts: item.socialMediaPosts || [],
      email: item.emailSeries ? 
        item.emailSeries.map((email: any) => 
          `Subject: ${email.subject}\n\n${email.body}`
        ) : [],
      emailSeries: item.emailSeries || [],
      reasoning: item.reasoning || null
    }));
  } else {
    return [{
      topicArea: data.title || data.topicArea || "Content Suggestions",
      pillarContent: typeof data.pillarContent === 'string' ? [data.pillarContent] : data.pillarContent || [],
      supportContent: typeof data.supportContent === 'string' ? [data.supportContent] : data.supportContent || [],
      supportPages: typeof data.supportContent === 'string' ? [data.supportContent] : data.supportContent || [],
      metaTags: data.metaTags || [],
      socialMedia: data.socialMediaPosts || [],
      socialMediaPosts: data.socialMediaPosts || [],
      email: data.emailSeries ? 
        data.emailSeries.map((email: any) => 
          `Subject: ${email.subject}\n\n${email.body}`
        ) : [],
      emailSeries: data.emailSeries || [],
      reasoning: data.reasoning || null
    }];
  }
};

// Main processing function
export const processAIResponse = (responseData: any): any[] => {
  if (!responseData) return [];
  
  console.log("Processing AI response:", responseData);
  
  // Check if it's AI Content Suggestions format
  if (isAIContentSuggestionsFormat(responseData)) {
    return formatAIContentSuggestions(responseData);
  }
  
  // Fallback for other formats
  if (Array.isArray(responseData)) {
    return responseData;
  }
  
  return [responseData];
};
