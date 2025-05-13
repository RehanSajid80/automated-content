
import React from "react";
import { Button } from "@/components/ui/button";
import { KeywordSearchSection } from "./KeywordSearchSection";
import { AISuggestionsButton } from "./AISuggestionsButton";
import { KeywordData } from "@/utils/excelUtils";

interface TopicSuggestionFormProps {
  topicArea: string;
  setTopicArea: (topicArea: string) => void;
  updateKeywords: (keywords: KeywordData[]) => void;
  localKeywords: KeywordData[];
  selectedKeywords: string[];
  toggleKeywordSelection: (keyword: string) => void;
  autoSelectTrendingKeywords: () => void;
  isAISuggestionMode: boolean;
  handleAISuggestions: () => Promise<void>;
  isLoading: boolean;
}

export const TopicSuggestionForm: React.FC<TopicSuggestionFormProps> = ({
  topicArea,
  setTopicArea,
  updateKeywords,
  localKeywords,
  selectedKeywords,
  toggleKeywordSelection,
  autoSelectTrendingKeywords,
  isAISuggestionMode,
  handleAISuggestions,
  isLoading
}) => {
  return (
    <div className="space-y-6 w-full">
      <KeywordSearchSection 
        topicArea={topicArea}
        setTopicArea={setTopicArea}
        updateKeywords={updateKeywords}
        localKeywords={localKeywords}
        selectedKeywords={selectedKeywords}
        toggleKeywordSelection={toggleKeywordSelection}
        autoSelectTrendingKeywords={autoSelectTrendingKeywords}
        isAISuggestionMode={isAISuggestionMode}
      />

      <AISuggestionsButton 
        onClick={handleAISuggestions}
        isLoading={isLoading}
        disabled={!topicArea}
      />
    </div>
  );
};
