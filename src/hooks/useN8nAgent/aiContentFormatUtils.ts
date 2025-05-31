
/**
 * Utilities for detecting and formatting AI Content Suggestions format
 */

// Helper function to check if the response is in AI Content Suggestions format
export const isAIContentSuggestionsFormat = (data: any): boolean => {
  if (!data) return false;
  
  console.log("aiContentFormatUtils: Checking if response is in AI Content Suggestions format", typeof data, data);
  
  // Check array format
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    const hasExpectedFields = Boolean(firstItem && 
      (firstItem.pillarContent || firstItem.supportContent || 
       firstItem.socialMediaPosts || firstItem.emailSeries || 
       firstItem.topicArea));
    console.log("aiContentFormatUtils: Array format check:", hasExpectedFields);
    return hasExpectedFields;
  }
  
  // Check single object format
  const hasExpectedFields = Boolean(data && 
    (data.pillarContent || data.supportContent || 
     data.socialMediaPosts || data.emailSeries || 
     data.topicArea));
  console.log("aiContentFormatUtils: Single object format check:", hasExpectedFields);
  return hasExpectedFields;
};

// Helper function to format AI Content Suggestions consistently
export const formatAIContentSuggestions = (data: any): any[] => {
  console.log("aiContentFormatUtils: Formatting AI Content Suggestions", data);
  
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
          typeof email === 'string' ? email : `Subject: ${email.subject || 'Email'}\n\n${email.body || email.content || email}`
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
          typeof email === 'string' ? email : `Subject: ${email.subject || 'Email'}\n\n${email.body || email.content || email}`
        ) : [],
      emailSeries: data.emailSeries || [],
      reasoning: data.reasoning || null
    }];
  }
};

// Enhanced response processing that handles multiple formats
export const processAIResponse = (responseData: any): any[] => {
  if (!responseData) {
    console.log("aiContentFormatUtils: No response data provided");
    return [];
  }
  
  console.log("aiContentFormatUtils: Processing AI response:", typeof responseData, responseData);
  
  // Handle raw string responses that might contain JSON
  if (typeof responseData === 'string') {
    console.log("aiContentFormatUtils: Processing string response");
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseData.match(/```json\s*([\s\S]*?)\s*```/) || 
                        responseData.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        console.log("aiContentFormatUtils: Found JSON in code block");
        const parsedData = JSON.parse(jsonMatch[1]);
        if (isAIContentSuggestionsFormat(parsedData)) {
          return formatAIContentSuggestions(parsedData);
        }
      }
      
      // Try to parse the entire string as JSON
      if (responseData.trim().startsWith('{') || responseData.trim().startsWith('[')) {
        console.log("aiContentFormatUtils: Trying to parse entire string as JSON");
        const parsedData = JSON.parse(responseData);
        if (isAIContentSuggestionsFormat(parsedData)) {
          return formatAIContentSuggestions(parsedData);
        }
      }
    } catch (error) {
      console.error("aiContentFormatUtils: Error parsing string response:", error);
    }
    
    // If we can't parse it, create a basic content structure
    return [{
      topicArea: "Generated Content",
      pillarContent: [responseData],
      supportContent: [],
      supportPages: [],
      metaTags: [],
      socialMedia: [],
      socialMediaPosts: [],
      email: [],
      emailSeries: [],
      reasoning: null
    }];
  }
  
  // Handle n8n response format with 'output' property
  if (Array.isArray(responseData) && responseData.length === 1 && responseData[0].output) {
    console.log("aiContentFormatUtils: Processing n8n output format");
    return processAIResponse(responseData[0].output);
  }
  
  // Handle object with output property
  if (responseData.output) {
    console.log("aiContentFormatUtils: Processing object with output property");
    return processAIResponse(responseData.output);
  }
  
  // Check if it's already in AI Content Suggestions format
  if (isAIContentSuggestionsFormat(responseData)) {
    console.log("aiContentFormatUtils: Response is already in AI Content Suggestions format");
    return formatAIContentSuggestions(responseData);
  }
  
  // Fallback for other formats
  console.log("aiContentFormatUtils: Using fallback format processing");
  if (Array.isArray(responseData)) {
    return responseData.map(item => ({
      topicArea: item.title || item.topicArea || "Content Suggestions",
      pillarContent: [item.content || item.text || JSON.stringify(item)],
      supportContent: [],
      supportPages: [],
      metaTags: [],
      socialMedia: [],
      socialMediaPosts: [],
      email: [],
      emailSeries: [],
      reasoning: null
    }));
  }
  
  return [{
    topicArea: responseData.title || responseData.topicArea || "Content Suggestions",
    pillarContent: [responseData.content || responseData.text || JSON.stringify(responseData)],
    supportContent: [],
    supportPages: [],
    metaTags: [],
    socialMedia: [],
    socialMediaPosts: [],
    email: [],
    emailSeries: [],
    reasoning: null
  }];
};
