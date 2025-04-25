
import { useState, useEffect } from "react";

// Modified interface to include index signature
interface ContentSections {
  pillar: string;
  support: string;
  meta: string;
  social: string;
  [key: string]: string; // Added index signature
}

export const useContentProcessor = (generatedContent: any[]) => {
  const [editableContent, setEditableContent] = useState<{[key: string]: string}>({});
  const [contentProcessed, setContentProcessed] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  useEffect(() => {
    if (generatedContent && generatedContent.length > 0) {
      console.log("Processing generatedContent:", generatedContent);
      setProcessingError(null);
      
      try {
        const contentItem = generatedContent[0];
        console.log("Processing content item:", contentItem);
        
        // Handle different content formats (output, content, or direct string)
        const output = contentItem.output || contentItem.content || "";
        if (!output) {
          console.error("No output content found in:", contentItem);
          setProcessingError("No content found in the response");
          return;
        }
        
        console.log("Processing output content length:", output.length);
        console.log("Processing output content preview:", output.substring(0, 100) + "...");
        
        try {
          // Check if this content has section markers
          const hasSections = output.includes("### Support Content") || 
                          output.includes("# Support Content") ||
                          output.includes("<h1>Common Questions") ||
                          output.includes("### Meta Tags") || 
                          output.includes("# Meta Tags") ||
                          output.includes("### Social Media Posts") ||
                          output.includes("# Social Media Posts");
          
          let sections: ContentSections = {
            pillar: "",
            support: "",
            meta: "",
            social: ""
          };
          
          if (hasSections) {
            console.log("Found section markers, parsing sections");
            
            // More robust section parsing with multiple possible delimiters
            const fullContent = output.trim();
            
            // Extract pillar content (everything before any support content marker)
            const supportMarkers = ["### Support Content", "# Support Content", "<h1>Common Questions"];
            let pillarContent = fullContent;
            
            for (const marker of supportMarkers) {
              if (fullContent.includes(marker)) {
                pillarContent = fullContent.split(marker)[0];
                break;
              }
            }
            sections.pillar = pillarContent.trim();
            
            // Extract support content
            const supportStartRegex = /(### Support Content|# Support Content|<h1>Common Questions)/i;
            const metaStartRegex = /(### Meta Tags|# Meta Tags)/i;
            const socialStartRegex = /(### Social Media Posts|# Social Media Posts)/i;
            
            if (supportStartRegex.test(fullContent)) {
              const afterSupportMatch = fullContent.split(supportStartRegex)[1] || "";
              if (metaStartRegex.test(afterSupportMatch)) {
                sections.support = afterSupportMatch.split(metaStartRegex)[0].trim();
              } else if (socialStartRegex.test(afterSupportMatch)) {
                sections.support = afterSupportMatch.split(socialStartRegex)[0].trim();
              } else {
                sections.support = afterSupportMatch.trim();
              }
            }
            
            // Extract meta content
            if (metaStartRegex.test(fullContent)) {
              const afterMetaMatch = fullContent.split(metaStartRegex)[1] || "";
              if (socialStartRegex.test(afterMetaMatch)) {
                sections.meta = afterMetaMatch.split(socialStartRegex)[0].trim();
              } else {
                sections.meta = afterMetaMatch.trim();
              }
            }
            
            // Extract social content
            if (socialStartRegex.test(fullContent)) {
              sections.social = fullContent.split(socialStartRegex)[1].trim();
            }
          } else {
            console.log("No section markers found, using full output as pillar content");
            sections = {
              pillar: output.trim(),
              support: "",
              meta: "",
              social: ""
            };
          }
          
          console.log("Parsed content sections:", sections);
          setEditableContent(sections);
          setContentProcessed(true);
        } catch (sectionError) {
          console.error("Error parsing content sections:", sectionError);
          // Fallback to using full output as pillar content
          setEditableContent({
            pillar: output.trim(),
            support: "",
            meta: "",
            social: ""
          });
          setContentProcessed(true);
        }
      } catch (error) {
        console.error("Error processing content:", error);
        setProcessingError("Error processing content. Please try again.");
        setContentProcessed(false);
      }
    }
  }, [generatedContent]);

  const retryProcessing = () => {
    // Force re-processing of content
    setContentProcessed(false);
    setTimeout(() => {
      try {
        if (generatedContent && generatedContent.length > 0) {
          const contentItem = generatedContent[0];
          const output = contentItem.output || contentItem.content || "";
          
          setEditableContent({
            pillar: output.trim(),
            support: "",
            meta: "",
            social: ""
          });
        }
        setContentProcessed(true);
      } catch (error) {
        console.error("Error in retry processing:", error);
        setProcessingError("Error reprocessing content.");
      }
    }, 100);
  };

  return {
    editableContent,
    contentProcessed,
    processingError,
    retryProcessing,
    setEditableContent
  };
};
