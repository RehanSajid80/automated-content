
import React from "react";
import { AIContentItem } from "./AIContentItem";
import { GenericContentItem } from "./GenericContentItem";
import { NoContentWarning } from "./NoContentWarning";

interface FormattedContentProps {
  processedContent: any[];
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ processedContent }) => {
  if (!processedContent || processedContent.length === 0) {
    return <NoContentWarning />;
  }

  return (
    <div className="space-y-6">
      {processedContent.map((item, index) => {
        // Handle objects wrapped in code blocks or "output" field
        let contentToDisplay = item;
        
        // Special case: Handle array with a single item containing "output" property with a string
        if (Array.isArray(processedContent) && 
            processedContent.length === 1 && 
            item.output && 
            typeof item.output === 'string') {
          console.log("Detected array with single output object, processing special case");
          
          // Try to extract JSON from code blocks (```json...```)
          const jsonMatch = item.output.match(/```json\s*([\s\S]*?)\s*```/) || 
                             item.output.match(/```\s*([\s\S]*?)\s*```/);
                              
          if (jsonMatch) {
            try {
              console.log("Found code block in output, extracting JSON");
              const extractedJson = JSON.parse(jsonMatch[1]);
              console.log("Extracted JSON from code block:", extractedJson);
              return (
                <div key={index} className="space-y-6">
                  {extractedJson.pillarContent || extractedJson.supportContent || 
                   extractedJson.socialMediaPosts || extractedJson.emailSeries ? (
                    <AIContentItem item={extractedJson} index={index} />
                  ) : (
                    <GenericContentItem item={extractedJson} index={index} />
                  )}
                </div>
              );
            } catch (err) {
              console.error("Failed to parse JSON from code block:", err);
              // Try to clean the JSON string and parse again (handle common issues)
              try {
                const cleanedJson = jsonMatch[1].replace(/\\n/g, '')
                                             .replace(/\\"/g, '"')
                                             .replace(/\\/g, '\\\\');
                const extractedJson = JSON.parse(cleanedJson);
                console.log("Extracted JSON from cleaned code block:", extractedJson);
                return (
                  <div key={index} className="space-y-6">
                    {extractedJson.pillarContent || extractedJson.supportContent || 
                     extractedJson.socialMediaPosts || extractedJson.emailSeries ? (
                      <AIContentItem item={extractedJson} index={index} />
                    ) : (
                      <GenericContentItem item={extractedJson} index={index} />
                    )}
                  </div>
                );
              } catch (cleanErr) {
                console.error("Failed to parse cleaned JSON from code block:", cleanErr);
              }
            }
          }
        }
        
        // Regular processing for other items
        if (item.output && typeof item.output === 'string') {
          console.log("Processing output string:", item.output.substring(0, 100));
          
          // Try to extract JSON from code blocks (```json...```)
          const jsonMatch = item.output.match(/```json\s*([\s\S]*?)\s*```/) || 
                           item.output.match(/```\s*([\s\S]*?)\s*```/);
                            
          if (jsonMatch) {
            try {
              const extractedJson = JSON.parse(jsonMatch[1]);
              console.log("Extracted JSON from code block:", extractedJson);
              contentToDisplay = extractedJson;
            } catch (err) {
              console.error("Failed to parse JSON from code block:", err);
              // Try to clean the JSON string and parse again (handle common issues)
              try {
                const cleanedJson = jsonMatch[1].replace(/\\n/g, '')
                                               .replace(/\\"/g, '"')
                                               .replace(/\\/g, '\\\\');
                const extractedJson = JSON.parse(cleanedJson);
                console.log("Extracted JSON from cleaned code block:", extractedJson);
                contentToDisplay = extractedJson;
              } catch (cleanErr) {
                console.error("Failed to parse cleaned JSON from code block:", cleanErr);
              }
            }
          } else {
            // Try to parse the entire output as JSON if no code blocks found
            try {
              if (item.output.trim().startsWith('{') || item.output.trim().startsWith('[')) {
                const parsedJson = JSON.parse(item.output);
                console.log("Parsed JSON from output:", parsedJson);
                contentToDisplay = parsedJson;
              }
            } catch (err) {
              console.error("Failed to parse output as direct JSON:", err);
            }
          }
        }

        // Enhanced check for AI content format - check more properties and be more lenient
        const isAIContent = contentToDisplay && (
          contentToDisplay.pillarContent !== undefined || 
          contentToDisplay.supportContent !== undefined || 
          contentToDisplay.supportPages !== undefined ||
          contentToDisplay.socialMediaPosts !== undefined || 
          contentToDisplay.socialMedia !== undefined ||
          contentToDisplay.emailSeries !== undefined ||
          contentToDisplay.email !== undefined ||
          contentToDisplay.reasoning !== undefined
        );
        
        console.log(`Item ${index} is AI content:`, isAIContent, "Content keys:", 
          contentToDisplay ? Object.keys(contentToDisplay) : "no content");
        
        return isAIContent ? 
          <AIContentItem key={index} item={contentToDisplay} index={index} /> : 
          <GenericContentItem key={index} item={item} index={index} />;
      })}
    </div>
  );
};
