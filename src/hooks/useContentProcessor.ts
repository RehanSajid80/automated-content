
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
    if (generatedContent.length > 0) {
      console.log("Processing generatedContent:", generatedContent);
      setProcessingError(null);
      
      try {
        const contentItem = generatedContent[0];
        console.log("Processing content item:", contentItem);
        
        const output = contentItem.output || contentItem.content || "";
        if (!output) {
          console.error("No output content found in:", contentItem);
          setProcessingError("No content found in the response");
          return;
        }
        
        console.log("Processing output content:", output.substring(0, 100) + "...");
        
        try {
          // Check if this content has section markers
          const hasSections = output.includes("### Support Content") || 
                           output.includes("### Meta Tags") || 
                           output.includes("### Social Media Posts");
          
          let sections: ContentSections = {
            pillar: "",
            support: "",
            meta: "",
            social: ""
          };
          
          if (hasSections) {
            console.log("Found section markers, parsing sections");
            
            // More robust section parsing
            const fullContent = output.trim();
            
            // Extract pillar content (everything before "### Support Content")
            sections.pillar = fullContent.split("### Support Content")[0]?.trim() || "";
            
            // Extract support content
            if (fullContent.includes("### Support Content")) {
              const afterSupport = fullContent.split("### Support Content")[1] || "";
              sections.support = afterSupport.split("### Meta Tags")[0]?.trim() || 
                                afterSupport.split("### Social Media Posts")[0]?.trim() || 
                                afterSupport.trim();
            }
            
            // Extract meta content
            if (fullContent.includes("### Meta Tags")) {
              const afterMeta = fullContent.split("### Meta Tags")[1] || "";
              sections.meta = afterMeta.split("### Social Media Posts")[0]?.trim() || 
                             afterMeta.trim();
            }
            
            // Extract social content
            if (fullContent.includes("### Social Media Posts")) {
              sections.social = fullContent.split("### Social Media Posts")[1]?.trim() || "";
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
    setTimeout(() => setContentProcessed(true), 100);
  };

  return {
    editableContent,
    contentProcessed,
    processingError,
    retryProcessing,
    setEditableContent
  };
};
