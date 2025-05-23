
import { useState } from "react";
import { KeywordData } from "@/utils/excelUtils";

/**
 * Hook for managing topic area functionality
 */
export const useTopicArea = () => {
  const [topicArea, setTopicArea] = useState<string>("");
  
  // Helper function to create keywords based on topic area
  const createTopicKeywords = (topic: string): KeywordData[] => {
    const baseKeywords: {[key: string]: string[]} = {
      "workspace-management": ["workspace optimization", "office layout", "workspace flexibility"],
      "office-analytics": ["office usage metrics", "workspace analytics", "office data insights"],
      "desk-booking": ["hot desk booking", "desk reservation system", "flexible seating"],
      "workplace-technology": ["workplace tech stack", "office technology solutions", "smart office"],
      "facility-management": ["facility maintenance", "building management", "space planning"],
      "asset-management": ["asset tracking software", "inventory management", "equipment lifecycle"]
    };
    
    const keywords = baseKeywords[topic] || [`${topic} solutions`, `${topic} software`, `${topic} best practices`];
    
    return keywords.map((keyword, index) => ({
      keyword,
      volume: 1000 - (index * 200),
      difficulty: 40 + (index * 5),
      cpc: 1.5 - (index * 0.2),
      trend: index === 0 ? "up" : "neutral"
    }));
  };
  
  return {
    topicArea,
    setTopicArea,
    createTopicKeywords
  };
};
