
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
      data = JSON.parse(responseText);
      console.log("Parsed webhook response data:", data);
    } catch (parseError) {
      console.log("Response is not valid JSON, treating as raw content");
      // If the response is not JSON, create a structured object with the raw text
      data = {
        content: [{ output: responseText }]
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
    
    // Check for new format with specific content sections
    if (data && (data.pillarContent || data.supportContent || data.metaTags || data.socialPosts || data.emailCampaign)) {
      console.log("Found structured content with specific sections");
      
      // Combine sections into a single output
      const combinedOutput = JSON.stringify({
        pillarContent: data.pillarContent || "",
        supportContent: data.supportContent || "",
        metaTags: data.metaTags || "",
        socialPosts: data.socialPosts || "",
        emailCampaign: data.emailCampaign || ""
      });
      
      contentArray = [{ 
        output: combinedOutput,
        title: data.title || "Generated Content" 
      }];
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
      } else {
        // As a last resort, stringify the whole response
        console.log("No standard content structure found, using entire response");
        contentArray = [{ output: JSON.stringify(data), title: "" }];
      }
      
      // Ensure every item has an output property
      contentArray = contentArray.map(item => {
        if (!item.output && item.content) {
          return { ...item, output: item.content, title: item.title || "" };
        } else if (!item.output) {
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
