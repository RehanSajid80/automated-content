
import { useState, useEffect } from "react";

export const useSelectedKeywords = (keywords: any[]) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Reset selected keywords when keyword data changes
  useEffect(() => {
    setSelectedKeywords([]);
  }, [keywords]);

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  return { selectedKeywords, setSelectedKeywords, toggleKeywordSelection };
};
