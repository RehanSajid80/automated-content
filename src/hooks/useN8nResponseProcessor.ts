
/**
 * This hook handles processing of n8n webhook responses
 */
export const useN8nResponseProcessor = () => {
  /**
   * Process the response from the n8n webhook
   * Handles various response formats and normalizes them
   */
  const processResponse = (responseText: string) => {
    console.log("Processing n8n response");
    
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
        title: ""
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
      
      contentArray = data.map(item => {
        // Check if this is the AI Content Suggestions format
        if (item.pillarContent || item.supportContent || item.socialMediaPosts || item.emailSeries) {
          console.log("Found AI Content Suggestions in array format");
          return {
            topicArea: item.title || "Content Suggestions",
            pillarContent: typeof item.pillarContent === 'string' ? [item.pillarContent] : item.pillarContent || [],
            supportPages: typeof item.supportContent === 'string' ? [item.supportContent] : item.supportContent || [],
            metaTags: item.metaTags || [],
            socialMedia: item.socialMediaPosts || [],
            email: item.emailSeries ? item.emailSeries.map((email: any) => 
              `Subject: ${email.subject}\n\n${email.body}`
            ) : [],
            reasoning: item.reasoning || null
          };
        } else {
          // Generic object in array - pass through
          return item;
        }
      });
      
      console.log("Processed array items:", contentArray.length);
    }
    // Check for AI Content Suggestions specific format (single object)
    else if (data && (data.pillarContent || data.supportContent || data.socialMediaPosts || data.emailSeries)) {
      console.log("Found AI Content Suggestions format as single object");
      
      // Transform the AI suggestions format to our content structure
      contentArray = [{
        topicArea: data.title || "Content Suggestions",
        pillarContent: typeof data.pillarContent === 'string' ? [data.pillarContent] : data.pillarContent || [],
        supportPages: typeof data.supportContent === 'string' ? [data.supportContent] : data.supportContent || [],
        metaTags: data.metaTags || [],
        socialMedia: data.socialMediaPosts || [],
        email: data.emailSeries ? data.emailSeries.map((email: any) => 
          `Subject: ${email.subject}\n\n${email.body}`
        ) : [],
        reasoning: data.reasoning || null
      }];
      
      console.log("Processed AI Content Suggestions object:", contentArray);
    }
    // Check for new format with specific content sections
    else if (data && (data.pillarContent || data.supportContent || data.metaTags || data.socialPosts || data.emailCampaign)) {
      console.log("Found structured content with specific sections");
      
      // Combine sections into a single output
      const combinedOutput = {
        pillarContent: data.pillarContent || "",
        supportContent: data.supportContent || "",
        metaTags: data.metaTags || [],
        socialMedia: data.socialPosts || [],
        email: data.emailCampaign || []
      };
      
      contentArray = [combinedOutput];
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
        // As a last resort, use the entire response
        console.log("No standard content structure found, using entire response");
        contentArray = [{ 
          output: JSON.stringify(data),
          pillarContent: data.pillarContent || "", 
          supportPages: data.supportPages || data.supportContent || "",
          title: data.title || "" 
        }];
      } else {
        console.log("Empty data object, returning empty content");
        contentArray = [];
      }
      
      // Ensure every item has an output property
      contentArray = contentArray.map(item => {
        if (!item.output && item.content) {
          return { ...item, output: item.content, title: item.title || "" };
        } else if (!item.output && !item.pillarContent) {
          return { ...item, output: JSON.stringify(item), title: item.title || "" };
        }
        return { ...item, title: item.title || "" };
      });
      
      console.log("Finished processing content:", contentArray);
    }
    
    return {
      suggestions,
      content: contentArray,
      title
    };
  };
  
  return {
    processResponse
  };
};
