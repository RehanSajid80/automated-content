
import { useState, useEffect } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useAIContentGeneration } from "./content-suggestions/useAIContentGeneration";

export const useContentSuggestionState = (keywords: KeywordData[]) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState("");
  const [localKeywords, setLocalKeywords] = useState<KeywordData[]>([]);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState("business-executive");
  const [selectedGoal, setSelectedGoal] = useState("thought-leadership");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);

  const {
    isN8nLoading,
    processKeywordsForAI,
    sendContentToN8n
  } = useAIContentGeneration();

  // Update local keywords when keywords prop changes
  useEffect(() => {
    if (keywords && keywords.length > 0) {
      console.log("useContentSuggestionState: Updated keywords:", keywords.length);
      setLocalKeywords(keywords);
    }
  }, [keywords]);

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const autoSelectTrendingKeywords = () => {
    const trendingKeywords = localKeywords
      .filter(k => k.trend === "up")
      .slice(0, 5)
      .map(k => k.keyword);
    setSelectedKeywords(trendingKeywords);
  };

  const updateKeywords = (newKeywords: KeywordData[]) => {
    setLocalKeywords(newKeywords);
  };

  const addCustomKeyword = (keyword: string) => {
    if (keyword.trim() && !customKeywords.includes(keyword.trim())) {
      setCustomKeywords(prev => [...prev, keyword.trim()]);
    }
  };

  const handleAISuggestions = async () => {
    if (!topicArea.trim()) {
      console.error("Topic area is required for AI suggestions");
      return;
    }

    console.log("Starting AI suggestions generation...");
    setIsAISuggestionMode(true);

    try {
      // Process keywords for AI
      const { keywordsToProcess, keywordsToSelect } = processKeywordsForAI(
        topicArea,
        localKeywords,
        selectedKeywords,
        customKeywords
      );

      console.log("Sending content to N8N with:", {
        topicArea,
        keywordsCount: keywordsToProcess.length,
        selectedCount: keywordsToSelect.length,
        persona: selectedPersona,
        goal: selectedGoal,
        customKeywords: customKeywords.length
      });

      // Send to N8N for processing
      const response = await sendContentToN8n(
        topicArea,
        keywordsToProcess,
        keywordsToSelect,
        selectedPersona,
        selectedGoal,
        customKeywords
      );

      console.log("AI suggestions response received:", response);
      
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      setIsAISuggestionMode(false);
    }
  };

  return {
    selectedKeywords,
    topicArea,
    setTopicArea,
    localKeywords,
    isN8nLoading,
    isAISuggestionMode,
    selectedPersona,
    setSelectedPersona,
    selectedGoal,
    setSelectedGoal,
    customKeywords,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    addCustomKeyword,
    handleAISuggestions
  };
};
