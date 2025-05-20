
import React from "react";
import { TopicAreaSelector } from "../TopicAreaSelector";
import SemrushIntegration from "../SemrushIntegration";
import { KeywordSelector } from "../KeywordSelector";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleKeywordsReceived = (keywords: KeywordData[]) => {
    if (keywords && keywords.length > 0) {
      console.log(`KeywordSearchSection received ${keywords.length} keywords`);
      updateKeywords(keywords);
      toast({
        title: "Keywords Updated",
        description: `Added ${keywords.length} keywords for analysis`,
      });
    } else {
      console.warn("Received empty keywords array");
    }
  };

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
          onKeywordsReceived={handleKeywordsReceived} 
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
