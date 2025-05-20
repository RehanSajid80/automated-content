
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AIContentGenerator } from "./AIContentGenerator";
import { useContentSuggestions } from "@/hooks/useContentSuggestions";
import { ContentSuggestionsProps, AISuggestion } from "./types/aiSuggestions";
import { ContentSuggestionsHeader } from "./content-suggestions/ContentSuggestionsHeader";
import { useContentSuggestionState } from "@/hooks/useContentSuggestionState";
import { TopicSuggestionForm } from "./content-suggestions/TopicSuggestionForm";

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const { toast } = useToast();

  const { 
    selectedKeywords,
    topicArea,
    setTopicArea,
    localKeywords,
    isN8nLoading,
    isAISuggestionMode,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    handleAISuggestions
  } = useContentSuggestionState(keywords);

  const { 
    isLoading, 
    apiError, 
    usedModel, 
    selectedModel 
  } = useContentSuggestions();

  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    toast({
      title: "Suggestion Selected",
      description: `You selected: ${suggestion.title}`,
    });
  };

  return (
    <div className={`space-y-4 w-full ${className}`}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Content Suggestions</CardTitle>
          <CardDescription>
            Use OpenAI to analyze keywords and suggest content topics for your website
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="space-y-6 w-full">
            <ContentSuggestionsHeader 
              apiError={apiError}
              usedModel={usedModel}
              selectedModel={selectedModel}
            />
            
            <TopicSuggestionForm
              topicArea={topicArea}
              setTopicArea={setTopicArea}
              updateKeywords={updateKeywords}
              localKeywords={localKeywords}
              selectedKeywords={selectedKeywords}
              toggleKeywordSelection={toggleKeywordSelection}
              autoSelectTrendingKeywords={autoSelectTrendingKeywords}
              isAISuggestionMode={isAISuggestionMode}
              handleAISuggestions={handleAISuggestions}
              isLoading={isN8nLoading || isLoading}
            />

            {isAISuggestionMode && (
              <AIContentGenerator 
                keywords={localKeywords}
                topicArea={topicArea}
                onSuggestionSelect={handleSuggestionSelect}
                isLoading={isN8nLoading || isLoading}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSuggestions;
