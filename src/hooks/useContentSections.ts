
import { useState, useEffect } from "react";

interface ContentItem {
  output?: string;
  content?: string;
  [key: string]: any;
}

interface ContentSections {
  pillar: string;
  support: string;
  meta: string;
  social: string;
  email: string;
}

export const useContentSections = (content: ContentItem[]) => {
  const [sections, setSections] = useState<ContentSections>({
    pillar: "",
    support: "",
    meta: "",
    social: "",
    email: ""
  });
  
  useEffect(() => {
    console.log("useContentSections hook received content:", content);
    
    if (!content || content.length === 0) {
      console.log("useContentSections: No content provided");
      return;
    }
    
    const rawContent = content[0]?.output || content[0]?.content || "";
    console.log("useContentSections: Raw content length:", rawContent.length);
    
    if (!rawContent) {
      console.log("useContentSections: No raw content found");
      return;
    }
    
    console.log("useContentSections: Start parsing content sections");
    
    try {
      // First check if the content is already structured as JSON
      try {
        // Handle case where the content is already structured in JSON format
        if (typeof rawContent === 'string' && 
            (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('['))) {
          const parsedJson = JSON.parse(rawContent);
          
          // Check if it's the expected format with our sections
          if (parsedJson.pillarContent || parsedJson.supportContent || 
              parsedJson.metaTags || parsedJson.socialPosts || parsedJson.emailCampaign) {
            
            console.log("useContentSections: Found JSON structured content");
            
            setSections({
              pillar: parsedJson.pillarContent || "",
              support: parsedJson.supportContent || "",
              meta: typeof parsedJson.metaTags === 'object' ? 
                JSON.stringify(parsedJson.metaTags, null, 2) : parsedJson.metaTags || "",
              social: Array.isArray(parsedJson.socialPosts) ? 
                parsedJson.socialPosts.join("\n\n") : parsedJson.socialPosts || "",
              email: typeof parsedJson.emailCampaign === 'object' ? 
                JSON.stringify(parsedJson.emailCampaign, null, 2) : parsedJson.emailCampaign || ""
            });
            
            return;
          }
        }
      } catch (jsonError) {
        console.log("useContentSections: Content is not in JSON format, will try text parsing");
      }
      
      // If not JSON, try to parse the content based on section markers
      const parsedSections = {
        pillar: "",
        support: "",
        meta: "",
        social: "",
        email: ""
      };
      
      // Look for section markers in the content
      const pillarMarkers = ["### Pillar Content", "# Pillar Content", "pillarContent:", "### 1. Pillar Content"];
      const supportMarkers = ["### Support Content", "# Support Content", "supportContent:", "### 2. Support"];
      const metaMarkers = ["### Meta Tags", "# Meta Tags", "metaTags:", "### 3. Meta"];
      const socialMarkers = ["### Social Media Posts", "# Social Media Posts", "socialPosts:", "### 4. Social"];
      const emailMarkers = ["### Email Campaign", "# Email Campaign", "emailCampaign:", "### 5. Email"];
      
      // Extract content for each section
      let pillarContent = "";
      let supportContent = "";
      let metaContent = "";
      let socialContent = "";
      let emailContent = "";
      
      // Helper function to extract content between markers
      const extractContent = (content: string, startMarkers: string[], nextMarkers: string[]) => {
        for (const marker of startMarkers) {
          if (content.includes(marker)) {
            const startIndex = content.indexOf(marker) + marker.length;
            let endIndex = content.length;
            
            // Find the next section marker
            for (const nextMarker of nextMarkers) {
              const nextIndex = content.indexOf(nextMarker, startIndex);
              if (nextIndex !== -1 && nextIndex < endIndex) {
                endIndex = nextIndex;
              }
            }
            
            return content.substring(startIndex, endIndex).trim();
          }
        }
        return "";
      };
      
      // Build array of all markers for finding next section
      const allMarkers = [...supportMarkers, ...metaMarkers, ...socialMarkers, ...emailMarkers];
      
      // Extract pillar content (everything before the first support marker)
      pillarContent = extractContent(rawContent, pillarMarkers, allMarkers);
      
      // Extract other sections
      const nextStartsAfterSupport = [...metaMarkers, ...socialMarkers, ...emailMarkers];
      supportContent = extractContent(rawContent, supportMarkers, nextStartsAfterSupport);
      
      const nextStartsAfterMeta = [...socialMarkers, ...emailMarkers];
      metaContent = extractContent(rawContent, metaMarkers, nextStartsAfterMeta);
      
      const nextStartsAfterSocial = [...emailMarkers];
      socialContent = extractContent(rawContent, socialMarkers, nextStartsAfterSocial);
      
      // Email content is everything after email marker
      emailContent = extractContent(rawContent, emailMarkers, []);
      
      // Update the parsed sections
      parsedSections.pillar = pillarContent;
      parsedSections.support = supportContent;
      parsedSections.meta = metaContent;
      parsedSections.social = socialContent;
      parsedSections.email = emailContent;
      
      // Log the resulting sections
      console.log("useContentSections: Parsed sections:", {
        pillar: parsedSections.pillar ? `${parsedSections.pillar.length} chars` : "empty",
        support: parsedSections.support ? `${parsedSections.support.length} chars` : "empty",
        meta: parsedSections.meta ? `${parsedSections.meta.length} chars` : "empty",
        social: parsedSections.social ? `${parsedSections.social.length} chars` : "empty",
        email: parsedSections.email ? `${parsedSections.email.length} chars` : "empty"
      });
      
      setSections(parsedSections);
    } catch (error) {
      console.error("useContentSections: Error parsing content:", error);
      // In case of error, set pillar content to the whole content
      setSections({
        pillar: rawContent,
        support: "",
        meta: "",
        social: "",
        email: ""
      });
    }
  }, [content]);
  
  return sections;
};
