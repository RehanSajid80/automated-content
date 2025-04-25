
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AIContentGenerator } from "./AIContentGenerator";
import { useContentSuggestions } from "@/hooks/useContentSuggestions";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import { ContentSuggestionsProps, AISuggestion } from "./types/aiSuggestions";
import { KeywordData } from "@/utils/excelUtils";
import { ContentSuggestionsHeader } from "./content-suggestions/ContentSuggestionsHeader";
import { KeywordSearchSection } from "./content-suggestions/KeywordSearchSection";
import { AISuggestionsButton } from "./content-suggestions/AISuggestionsButton";

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState<string>("");
  const [localKeywords, setLocalKeywords] = useState(keywords);
  const [isN8nLoading, setIsN8nLoading] = useState(false);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const { toast } = useToast();
  const { isLoading, apiError, usedModel, selectedModel } = useContentSuggestions();
  const { sendToN8n } = useN8nAgent();
  const { targetUrl } = useUrlSuggestions();

  const toggleKeywordSelection = (keyword: string) => {
    if (isAISuggestionMode) return;
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };
  
  const autoSelectTrendingKeywords = () => {
    if (isAISuggestionMode) return;
    
    const trendingKeywords = localKeywords
      .filter(kw => kw.trend === "up")
      .map(kw => kw.keyword);
    
    setSelectedKeywords(trendingKeywords);
    
    if (trendingKeywords.length > 0) {
      toast({
        title: "Trending Keywords Selected",
        description: `Selected ${trendingKeywords.length} trending keywords automatically`,
      });
    } else {
      toast({
        title: "No Trending Keywords Found",
        description: "No trending keywords were found in your dataset",
      });
    }
  };

  const handleAISuggestions = async () => {
    if (!topicArea) {
      toast({
        title: "Topic Area Required",
        description: "Please select a topic area before getting AI suggestions",
      });
      return;
    }

    setIsN8nLoading(true);
    setIsAISuggestionMode(true);
    
    try {
      await sendToN8n({
        keywords: selectedKeywords.length > 0 
          ? localKeywords.filter(kw => selectedKeywords.includes(kw.keyword)) 
          : localKeywords,
        topicArea,
        targetUrl: targetUrl || "https://www.officespacesoftware.com",
        url: targetUrl || "https://www.officespacesoftware.com",
        requestType: 'contentSuggestions'
      });
      
      toast({
        title: "AI Suggestions Ready",
        description: "Select one of the suggestions below to proceed",
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI suggestions",
      });
    } finally {
      setIsN8nLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    toast({
      title: "Suggestion Selected",
      description: `You selected: ${suggestion.title}`,
    });
  };

  const updateKeywords = (newKeywords: KeywordData[]) => {
    if (newKeywords && newKeywords.length > 0) {
      setLocalKeywords(newKeywords);
      setSelectedKeywords([]);
      toast({
        title: "Keywords Updated",
        description: `Added ${newKeywords.length} keywords for ${topicArea || "general"} analysis`,
      });
    }
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
              isLoading={isN8nLoading}
              disabled={!topicArea}
            />

            {isAISuggestionMode && (
              <AIContentGenerator 
                keywords={localKeywords}
                topicArea={topicArea}
                onSuggestionSelect={handleSuggestionSelect}
                isLoading={isN8nLoading}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSuggestions;
