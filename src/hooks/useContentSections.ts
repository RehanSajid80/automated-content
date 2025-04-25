
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
    if (!content || content.length === 0) return;
    
    const rawContent = content[0]?.output || content[0]?.content || "";
    if (!rawContent) return;
    
    const parsedSections = {
      pillar: "",
      support: "",
      meta: "",
      social: ""
    };
    
    // Parse pillar content
    const supportMarkers = ["### Support Content", "# Support Content", "<h1>Common Questions"];
    let pillarContent = rawContent;
    
    for (const marker of supportMarkers) {
      if (rawContent.includes(marker)) {
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
      const afterMetaMatch = rawContent.split(metaStartRegex)[1] || "";
      if (socialStartRegex.test(afterMetaMatch)) {
        parsedSections.meta = afterMetaMatch.split(socialStartRegex)[0].trim();
      } else {
        parsedSections.meta = afterMetaMatch.trim();
      }
    }
    
    if (socialStartRegex.test(rawContent)) {
      parsedSections.social = rawContent.split(socialStartRegex)[1].trim();
    }
    
    setSections(parsedSections);
  }, [content]);
  
  return sections;
};
