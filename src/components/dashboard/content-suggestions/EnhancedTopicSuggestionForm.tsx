
import React from "react";
import { Button } from "@/components/ui/button";
import { KeywordSearchSection } from "./KeywordSearchSection";
import { AISuggestionsButton } from "./AISuggestionsButton";
import { KeywordData } from "@/utils/excelUtils";
import { PersonaSelector } from "./PersonaSelector";
import { ContentGoalSelector } from "./ContentGoalSelector";
import { Card, CardContent } from "@/components/ui/card";

interface EnhancedTopicSuggestionFormProps {
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
  selectedPersona: string;
  setSelectedPersona: (persona: string) => void;
  selectedGoal: string;
  setSelectedGoal: (goal: string) => void;
  customKeywords?: string[];
  addCustomKeyword?: (keyword: string) => void;
}

export const EnhancedTopicSuggestionForm: React.FC<EnhancedTopicSuggestionFormProps> = ({
  topicArea,
  setTopicArea,
  updateKeywords,
  localKeywords,
  selectedKeywords,
  toggleKeywordSelection,
  autoSelectTrendingKeywords,
  isAISuggestionMode,
  handleAISuggestions,
  isLoading,
  selectedPersona,
  setSelectedPersona,
  selectedGoal,
  setSelectedGoal,
  customKeywords = [],
  addCustomKeyword
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
        customKeywords={customKeywords}
        addCustomKeyword={addCustomKeyword}
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonaSelector 
              selectedPersona={selectedPersona}
              onPersonaChange={setSelectedPersona}
              disabled={isLoading || isAISuggestionMode}
            />
            
            <ContentGoalSelector
              selectedGoal={selectedGoal}
              onGoalChange={setSelectedGoal}
              disabled={isLoading || isAISuggestionMode}
            />
          </div>
        </CardContent>
      </Card>

      <AISuggestionsButton 
        onClick={handleAISuggestions}
        isLoading={isLoading}
        disabled={!topicArea}
      />
    </div>
  );
};
