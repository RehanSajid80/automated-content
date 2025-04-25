
import React from "react";
import { TopicAreaSelector } from "../TopicAreaSelector";
import SemrushIntegration from "../SemrushIntegration";  // Changed to default import
import { KeywordSelector } from "../KeywordSelector";
import { KeywordData } from "@/utils/excelUtils";

interface KeywordSearchSectionProps {
  topicArea: string;
  setTopicArea: (area: string) => void;
  updateKeywords: (keywords: KeywordData[]) => void;
  localKeywords: KeywordData[];
  selectedKeywords: string[];
  toggleKeywordSelection: (keyword: string) => void;
  autoSelectTrendingKeywords: () => void;
  isAISuggestionMode: boolean;
}

export const KeywordSearchSection: React.FC<KeywordSearchSectionProps> = ({
  topicArea,
  setTopicArea,
  updateKeywords,
  localKeywords,
  selectedKeywords,
  toggleKeywordSelection,
  autoSelectTrendingKeywords,
  isAISuggestionMode,
}) => {
  return (
    <div className="p-4 border border-border rounded-md bg-card w-full">
      <h3 className="text-base font-medium mb-3">Search for Keywords</h3>
      <div className="space-y-4 w-full">
        <TopicAreaSelector 
          value={topicArea}
          onChange={setTopicArea}
          disabled={isAISuggestionMode}
        />
        
        <SemrushIntegration 
          onKeywordsReceived={updateKeywords} 
          topicArea={topicArea}
          disabled={isAISuggestionMode}
        />
        
        <KeywordSelector
          keywords={localKeywords}
          selectedKeywords={selectedKeywords}
          onKeywordToggle={toggleKeywordSelection}
          onAutoSelect={autoSelectTrendingKeywords}
          disabled={isAISuggestionMode}
        />
      </div>
    </div>
  );
};

