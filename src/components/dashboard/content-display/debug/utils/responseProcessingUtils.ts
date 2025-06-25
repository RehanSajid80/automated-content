
/**
 * Utility functions for processing raw API responses
 */

/**
 * Process raw response if it contains JSON as a string within code blocks
 */
export const preprocessRawResponse = (rawResponse: any) => {
  console.log("TESTING - Preprocessing raw response:", typeof rawResponse);
  
  try {
    // Handle the specific n8n response format with structured content sections
    if (Array.isArray(rawResponse) && 
        rawResponse.length === 1 && 
        rawResponse[0].output && 
        typeof rawResponse[0].output === 'string') {
      
      console.log("TESTING - Detected structured n8n content format");
      const outputContent = rawResponse[0].output;
      
      // Check if this contains structured content sections with ## markers
      if (outputContent.includes('## Pillar Content:') || 
          outputContent.includes('## Support Content:') ||
          outputContent.includes('## Meta Tags') ||
          outputContent.includes('## Social Media Posts') ||
          outputContent.includes('## Email Campaign')) {
        
        console.log("TESTING - Found structured content sections, parsing...");
        
        // Parse the structured content into sections
        const sections = {
          pillarContent: extractSection(outputContent, '## Pillar Content:', '## Support Content:'),
          supportContent: extractSection(outputContent, '## Support Content:', '## Meta Tags'),
          metaTags: extractSection(outputContent, '## Meta Tags', '## Social Media Posts'),
          socialMediaPosts: extractSection(outputContent, '## Social Media Posts', '## Email Campaign'),
          emailSeries: extractSection(outputContent, '## Email Campaign', null)
        };
        
        console.log("TESTING - Parsed structured sections:", Object.keys(sections).filter(key => sections[key]));
        return sections;
      }
    }
    
    // Direct handling for AI Content Suggestions format - check first
    if (typeof rawResponse === 'object' && (
      rawResponse.pillarContent !== undefined ||
      rawResponse.supportContent !== undefined ||
      rawResponse.socialMediaPosts !== undefined ||
      rawResponse.emailSeries !== undefined
    )) {
      console.log("TESTING - Using direct AI Content Suggestions format object");
      return rawResponse;
    }
    
    // Handle array of AI Content Suggestions format
    if (Array.isArray(rawResponse) && rawResponse.length > 0 && 
        typeof rawResponse[0] === 'object' && (
          rawResponse[0].pillarContent !== undefined ||
          rawResponse[0].supportContent !== undefined ||
          rawResponse[0].socialMediaPosts !== undefined ||
          rawResponse[0].emailSeries !== undefined
        )) {
      console.log("TESTING - Using direct AI Content Suggestions format array");
      return rawResponse;
    }
    
    // First, handle the special case of n8n response structure:
    // Array with single object containing 'output' property with a string containing JSON code block
    if (Array.isArray(rawResponse) && 
        rawResponse.length === 1 && 
        rawResponse[0].output && 
        typeof rawResponse[0].output === 'string') {
      
      console.log("TESTING - Detected n8n response format, extracting from output property");
      const outputStr = rawResponse[0].output;
      
      // Extract JSON from code block
      const jsonMatch = outputStr.match(/```json\s*([\s\S]*?)\s*```/) || 
                        outputStr.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[1]);
          console.log("TESTING - Successfully extracted JSON from n8n output code block");
          return extractedJson;
        } catch (err) {
          console.error("TESTING - Error parsing JSON from n8n output code block:", err);
        }
      }
    }
  
    // Standard processing for other formats
    if (typeof rawResponse === 'string') {
      // Try to extract JSON from code blocks
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                        rawResponse.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch (err) {
          console.error("TESTING - Failed to parse JSON from code block in raw response");
        }
      }
      
      // Try parsing as direct JSON
      if (rawResponse.trim().startsWith('{') || rawResponse.trim().startsWith('[')) {
        try {
          return JSON.parse(rawResponse);
        } catch (err) {
          console.error("TESTING - Failed to parse raw response as direct JSON");
        }
      }
    } else if (Array.isArray(rawResponse) && rawResponse.length > 0) {
      // Check if the array contains objects with an output property that might contain code blocks
      const firstItem = rawResponse[0];
      if (firstItem && firstItem.output && typeof firstItem.output === 'string') {
        console.log("TESTING - Found output property in array item:", firstItem.output.substring(0, 100));
        // Try to extract JSON from code blocks in the output
        const jsonMatch = firstItem.output.match(/```json\s*([\s\S]*?)\s*```/) || 
                          firstItem.output.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[1]);
          } catch (err) {
            console.error("TESTING - Failed to parse JSON from code block in output");
          }
        }
      }
    } else if (rawResponse?.output && typeof rawResponse.output === 'string') {
      // Handle object with output property that might contain JSON
      console.log("TESTING - Found output property in object:", rawResponse.output.substring(0, 100));
      return preprocessRawResponse(rawResponse.output);
    }
    
    return rawResponse;
  } catch (error) {
    console.error("TESTING - Error preprocessing raw response:", error);
    return rawResponse;
  }
};

// Helper function to extract content sections from structured text
const extractSection = (content: string, startMarker: string, endMarker: string | null): string => {
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) return '';
  
  const contentStart = startIndex + startMarker.length;
  let contentEnd = content.length;
  
  if (endMarker) {
    const endIndex = content.indexOf(endMarker, contentStart);
    if (endIndex !== -1) {
      contentEnd = endIndex;
    }
  }
  
  return content.substring(contentStart, contentEnd).trim();
};
