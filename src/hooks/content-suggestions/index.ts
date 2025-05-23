
import { KeywordData } from "@/utils/excelUtils";
import { useKeywordSelection } from "./useKeywordSelection";
import { useTopicArea } from "./useTopicArea";
import { usePersonaGoals } from "./usePersonaGoals";
import { useAIContentGeneration } from "./useAIContentGeneration";

/**
 * Main hook that combines all content suggestion related hooks
 */
export const useEnhancedContentSuggestions = (initialKeywords: KeywordData[]) => {
  const {
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
  } = useKeywordSelection(initialKeywords);
  
  const {
    topicArea,
    setTopicArea,
    createTopicKeywords
  } = useTopicArea();
  
  const {
    selectedPersona,
    setSelectedPersona,
    selectedGoal,
    setSelectedGoal
  } = usePersonaGoals();
  
  const {
    isN8nLoading,
    setIsN8nLoading,
    processKeywordsForAI,
    sendContentToN8n
  } = useAIContentGeneration();
  
  // Main function to handle AI suggestions
  const handleAISuggestions = async () => {
    if (!topicArea) {
      toast.success("Topic Area Required", {
        description: "Please select a topic area before getting AI suggestions"
      });
      return;
    }
    
    let updatedKeywords = localKeywords;
    
    // If no specific keywords are selected, generate dummy keywords for the topic
    if (selectedKeywords.length === 0) {
      // Create a dummy keyword for the topic
      const dummyKeywords: KeywordData[] = [
        {
          keyword: topicArea,
          volume: 1000,
          difficulty: 50,
          cpc: 1.0,
          trend: "up"
        }
      ];
      
      // Add a few more keywords based on the topic area
      const topicKeywords = createTopicKeywords(topicArea);
      updatedKeywords = [...dummyKeywords, ...topicKeywords];
      
      setLocalKeywords(updatedKeywords);
      setSelectedKeywords([topicArea]);
    }
    
    setIsAISuggestionMode(true);
    
    const { keywordsToProcess, keywordsToSelect } = processKeywordsForAI(
      topicArea,
      updatedKeywords,
      selectedKeywords.length === 0 ? [topicArea] : selectedKeywords,
      customKeywords
    );
    
    await sendContentToN8n(
      topicArea,
      keywordsToProcess,
      keywordsToSelect,
      selectedPersona,
      selectedGoal,
      customKeywords
    );
  };
  
  return {
    selectedKeywords,
    topicArea,
    setTopicArea,
    localKeywords,
    isN8nLoading,
    isAISuggestionMode,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    handleAISuggestions,
    selectedPersona,
    setSelectedPersona,
    selectedGoal,
    setSelectedGoal,
    customKeywords,
    addCustomKeyword
  };
};

// Missing toast import in index.ts
import { toast } from "sonner";

// Re-export all hooks for direct imports when needed
export { useKeywordSelection } from './useKeywordSelection';
export { useTopicArea } from './useTopicArea';
export { usePersonaGoals } from './usePersonaGoals';
export { useAIContentGeneration } from './useAIContentGeneration';
