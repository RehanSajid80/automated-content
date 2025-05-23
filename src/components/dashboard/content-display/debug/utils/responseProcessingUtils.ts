
/**
 * Utility functions for processing raw API responses
 */

/**
 * Process raw response if it contains JSON as a string within code blocks
 */
export const preprocessRawResponse = (rawResponse: any) => {
  console.log("Preprocessing raw response:", typeof rawResponse);
  
  try {
    // First, handle the special case of n8n response structure:
    // Array with single object containing 'output' property with a string containing JSON code block
    if (Array.isArray(rawResponse) && 
        rawResponse.length === 1 && 
        rawResponse[0].output && 
        typeof rawResponse[0].output === 'string') {
      
      console.log("Detected n8n response format, extracting from output property");
      const outputStr = rawResponse[0].output;
      
      // Extract JSON from code block
      const jsonMatch = outputStr.match(/```json\s*([\s\S]*?)\s*```/) || 
                        outputStr.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[1]);
          console.log("Successfully extracted JSON from n8n output code block");
          return extractedJson;
        } catch (err) {
          console.error("Error parsing JSON from n8n output code block:", err);
          // Try cleaning the JSON string
          try {
            const cleanedJson = jsonMatch[1]
              .replace(/\\n/g, '')
              .replace(/\\"/g, '"')
              .replace(/\\/g, '\\\\');
            return JSON.parse(cleanedJson);
          } catch (cleanErr) {
            console.error("Failed to parse cleaned JSON from n8n output code block");
          }
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
          console.error("Failed to parse JSON from code block in raw response");
          // Try to clean and parse again
          try {
            const cleanedJson = jsonMatch[1].replace(/\\n/g, '')
                                            .replace(/\\"/g, '"')
                                            .replace(/\\/g, '\\\\');
            return JSON.parse(cleanedJson);
          } catch (cleanErr) {
            console.error("Failed to clean and parse JSON from code block");
          }
        }
      }
      
      // Try parsing as direct JSON
      if (rawResponse.trim().startsWith('{') || rawResponse.trim().startsWith('[')) {
        try {
          return JSON.parse(rawResponse);
        } catch (err) {
          console.error("Failed to parse raw response as direct JSON");
        }
      }
    } else if (Array.isArray(rawResponse) && rawResponse.length > 0) {
      // Check if the array contains objects with an output property that might contain code blocks
      const firstItem = rawResponse[0];
      if (firstItem && firstItem.output && typeof firstItem.output === 'string') {
        console.log("Found output property in array item:", firstItem.output.substring(0, 100));
        // Try to extract JSON from code blocks in the output
        const jsonMatch = firstItem.output.match(/```json\s*([\s\S]*?)\s*```/) || 
                          firstItem.output.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[1]);
          } catch (err) {
            console.error("Failed to parse JSON from code block in output");
            try {
              const cleanedJson = jsonMatch[1].replace(/\\n/g, '')
                                            .replace(/\\"/g, '"')
                                            .replace(/\\/g, '\\\\');
              return JSON.parse(cleanedJson);
            } catch (cleanErr) {
              console.error("Failed to clean and parse JSON from output");
            }
          }
        }
      }
    } else if (rawResponse?.output && typeof rawResponse.output === 'string') {
      // Handle object with output property that might contain JSON
      console.log("Found output property in object:", rawResponse.output.substring(0, 100));
      return preprocessRawResponse(rawResponse.output);
    }
    
    return rawResponse;
  } catch (error) {
    console.error("Error preprocessing raw response:", error);
    return rawResponse;
  }
};

