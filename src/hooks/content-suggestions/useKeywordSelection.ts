
import { useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { toast } from "sonner";

/**
 * Hook for managing keyword selection functionality
 */
export const useKeywordSelection = (initialKeywords: KeywordData[]) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [localKeywords, setLocalKeywords] = useState(initialKeywords);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  
  // Toggle selection of a keyword
  const toggleKeywordSelection = (keyword: string) => {
    if (isAISuggestionMode) return;
    
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };
  
  // Add a custom keyword
  const addCustomKeyword = (keyword: string) => {
    if (isAISuggestionMode) return;
    
    if (!customKeywords.includes(keyword)) {
      setCustomKeywords(prev => [...prev, keyword]);
      // Also add to selected keywords
      if (!selectedKeywords.includes(keyword)) {
        setSelectedKeywords(prev => [...prev, keyword]);
      }
    }
  };
  
  // Auto-select trending keywords
  const autoSelectTrendingKeywords = () => {
    if (isAISuggestionMode) return;
    
    const trendingKeywords = localKeywords
      .filter(kw => kw.trend === "up")
      .map(kw => kw.keyword);
    
    setSelectedKeywords(trendingKeywords);
    
    if (trendingKeywords.length > 0) {
      toast.success("Trending Keywords Selected", {
        description: `Selected ${trendingKeywords.length} trending keywords automatically`
      });
    } else {
      toast.error("No Trending Keywords Found", {
        description: "No trending keywords were found in your dataset"
      });
    }
  };
  
  // Update keywords list
  const updateKeywords = (newKeywords: KeywordData[]) => {
    if (newKeywords && newKeywords.length > 0) {
      setLocalKeywords(newKeywords);
      setSelectedKeywords([]);
      toast.success("Keywords Updated", {
        description: `Added ${newKeywords.length} keywords for analysis`
      });
    }
  };
  
  return {
    selectedKeywords,
    setSelectedKeywords,
    localKeywords,
    setLocalKeywords,
    isAISuggestionMode,
    setIsAISuggestionMode,
    customKeywords,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    addCustomKeyword
  };
};
