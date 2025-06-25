
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
        
        // Handle the new structured format from n8n response preprocessing
        if (contentItem.pillarContent || contentItem.supportContent || 
            contentItem.metaTags || contentItem.socialMediaPosts || contentItem.emailSeries) {
          console.log("Found structured content format from preprocessing");
          
          const sections: ContentSections = {
            pillar: contentItem.pillarContent || "",
            support: contentItem.supportContent || "",
            meta: typeof contentItem.metaTags === 'object' ? 
              JSON.stringify(contentItem.metaTags, null, 2) : (contentItem.metaTags || ""),
            social: Array.isArray(contentItem.socialMediaPosts) ? 
              contentItem.socialMediaPosts.join("\n\n") : (contentItem.socialMediaPosts || "")
          };
          
          console.log("Processed structured content sections:", 
            Object.keys(sections).filter(key => sections[key].length > 0));
          
          setEditableContent(sections);
          setContentProcessed(true);
          return;
        }
        
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
          // Check if this content has section markers - Updated to handle ## markers
          const hasSections = output.includes("### Support Content") || 
                          output.includes("# Support Content") ||
                          output.includes("<h1>Common Questions") ||
                          output.includes("### Meta Tags") || 
                          output.includes("# Meta Tags") ||
                          output.includes("### Social Media Posts") ||
                          output.includes("# Social Media Posts") ||
                          // Check for the new format markers
                          output.includes("## Support Content:") ||
                          output.includes("## Meta Tags") ||
                          output.includes("## Social Media Posts") ||
                          output.includes("## Email Campaign");
          
          let sections: ContentSections = {
            pillar: "",
            support: "",
            meta: "",
            social: ""
          };
          
          if (hasSections) {
            console.log("Found section markers, parsing sections");
            
            const fullContent = output.trim();
            
            // Extract pillar content (everything before any support content marker)
            const supportMarkers = [
              "### Support Content", "# Support Content", "<h1>Common Questions", 
              "## Support Content:", "---\n\n## Support Content:"
            ];
            let pillarContent = fullContent;
            
            for (const marker of supportMarkers) {
              if (fullContent.includes(marker)) {
                pillarContent = fullContent.split(marker)[0];
                break;
              }
            }
            sections.pillar = pillarContent.trim();
            
            // Extract support content
            const supportStartRegex = /(### Support Content|# Support Content|<h1>Common Questions|## Support Content:)/i;
            const metaStartRegex = /(### Meta Tags|# Meta Tags|## Meta Tags)/i;
            const socialStartRegex = /(### Social Media Posts|# Social Media Posts|## Social Media Posts)/i;
            
            if (supportStartRegex.test(fullContent)) {
              const afterSupportMatch = fullContent.split(supportStartRegex)[2] || "";
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
              const afterMetaMatch = fullContent.split(metaStartRegex)[2] || "";
              if (socialStartRegex.test(afterMetaMatch)) {
                sections.meta = afterMetaMatch.split(socialStartRegex)[0].trim();
              } else {
                sections.meta = afterMetaMatch.trim();
              }
            }
            
            // Extract social content
            if (socialStartRegex.test(fullContent)) {
              const socialContent = fullContent.split(socialStartRegex)[2];
              if (socialContent) {
                // Stop at email campaign section if it exists
                const emailRegex = /(## Email Campaign)/i;
                if (emailRegex.test(socialContent)) {
                  sections.social = socialContent.split(emailRegex)[0].trim();
                } else {
                  sections.social = socialContent.trim();
                }
              }
            }

            console.log("Parsed sections from content:", 
              Object.keys(sections).map(key => `${key}: ${sections[key].substring(0, 30)}...`));
          } else {
            console.log("No section markers found, using full output as pillar content");
            sections = {
              pillar: output.trim(),
              support: "",
              meta: "",
              social: ""
            };
          }
          
          console.log("Final parsed content sections:", 
            Object.keys(sections).filter(key => sections[key].length > 0));
          
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
    } else {
      console.log("No content to process - generatedContent is empty or undefined");
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
