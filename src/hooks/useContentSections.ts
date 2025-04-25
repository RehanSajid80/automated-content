
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
}

export const useContentSections = (content: ContentItem[]) => {
  const [sections, setSections] = useState<ContentSections>({
    pillar: "",
    support: "",
    meta: "",
    social: ""
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
    console.log("useContentSections: Content starts with:", rawContent.substring(0, 100));
    
    const parsedSections = {
      pillar: "",
      support: "",
      meta: "",
      social: ""
    };
    
    try {
      // Log the markers we're looking for
      console.log("useContentSections: Looking for section markers");
      console.log("Contains '### Support Content':", rawContent.includes("### Support Content"));
      console.log("Contains '### Meta Tags':", rawContent.includes("### Meta Tags"));
      console.log("Contains '### Social Media Posts':", rawContent.includes("### Social Media Posts"));
      
      // Parse pillar content
      const supportMarkers = ["### Support Content", "# Support Content", "<h1>Common Questions"];
      let pillarContent = rawContent;
      
      for (const marker of supportMarkers) {
        if (rawContent.includes(marker)) {
          console.log(`useContentSections: Found marker '${marker}'`);
          pillarContent = rawContent.split(marker)[0];
          break;
        }
      }
      parsedSections.pillar = pillarContent.trim();
      
      // Parse other sections
      const supportStartRegex = /(### Support Content|# Support Content|<h1>Common Questions)/i;
      const metaStartRegex = /(### Meta Tags|# Meta Tags)/i;
      const socialStartRegex = /(### Social Media Posts|# Social Media Posts)/i;
      
      if (supportStartRegex.test(rawContent)) {
        console.log("useContentSections: Found support content section");
        const afterSupportMatch = rawContent.split(supportStartRegex)[1] || "";
        if (metaStartRegex.test(afterSupportMatch)) {
          parsedSections.support = afterSupportMatch.split(metaStartRegex)[0].trim();
        } else if (socialStartRegex.test(afterSupportMatch)) {
          parsedSections.support = afterSupportMatch.split(socialStartRegex)[0].trim();
        } else {
          parsedSections.support = afterSupportMatch.trim();
        }
      }
      
      if (metaStartRegex.test(rawContent)) {
        console.log("useContentSections: Found meta tags section");
        const afterMetaMatch = rawContent.split(metaStartRegex)[1] || "";
        if (socialStartRegex.test(afterMetaMatch)) {
          parsedSections.meta = afterMetaMatch.split(socialStartRegex)[0].trim();
        } else {
          parsedSections.meta = afterMetaMatch.trim();
        }
      }
      
      if (socialStartRegex.test(rawContent)) {
        console.log("useContentSections: Found social media posts section");
        parsedSections.social = rawContent.split(socialStartRegex)[1].trim();
      }
      
      // Log the resulting sections
      console.log("useContentSections: Parsed sections:", {
        pillar: parsedSections.pillar ? `${parsedSections.pillar.length} chars` : "empty",
        support: parsedSections.support ? `${parsedSections.support.length} chars` : "empty",
        meta: parsedSections.meta ? `${parsedSections.meta.length} chars` : "empty",
        social: parsedSections.social ? `${parsedSections.social.length} chars` : "empty"
      });
      
      setSections(parsedSections);
    } catch (error) {
      console.error("useContentSections: Error parsing content:", error);
      // In case of error, set pillar content to the whole content
      setSections({
        pillar: rawContent,
        support: "",
        meta: "",
        social: ""
      });
    }
  }, [content]);
  
  return sections;
};
