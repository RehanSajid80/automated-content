
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, SparklesIcon, BrainCircuit } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TopicAreaSelector } from "./TopicAreaSelector";
import { AIContentGenerator } from "./AIContentGenerator";
import SemrushIntegration from "./SemrushIntegration";
import { KeywordSelector } from "./KeywordSelector";
import { useContentSuggestions } from "@/hooks/useContentSuggestions";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import { AISuggestion, ContentSuggestionsProps } from "./types/aiSuggestions";

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState<string>("");
  const [localKeywords, setLocalKeywords] = useState(keywords);
  const [isN8nLoading, setIsN8nLoading] = useState(false);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>("");
  const { toast } = useToast();
  const { isLoading, apiError, usedModel, selectedModel } = useContentSuggestions();
  const { sendToN8n } = useN8nAgent();

  const toggleKeywordSelection = (keyword: string) => {
    if (isAISuggestionMode) return;
    
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };
  
  // Define the missing autoSelectTrendingKeywords function
  const autoSelectTrendingKeywords = () => {
    if (isAISuggestionMode) return;
    
    // Filter keywords with "up" trend and select them automatically
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
        variant: "destructive",
      });
      return;
    }

    setIsN8nLoading(true);
    setIsAISuggestionMode(true);
    
    try {
      await sendToN8n({
        keywords: selectedKeywords.length > 0 ? localKeywords.filter(kw => selectedKeywords.includes(kw.keyword)) : localKeywords,
        topicArea,
        targetUrl: targetUrl || window.location.origin,
        url: targetUrl || undefined,
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
        variant: "destructive",
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
            {apiError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>OpenAI Error</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            
            {usedModel && usedModel !== selectedModel && (
              <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
                <SparklesIcon className="h-4 w-4" />
                <AlertTitle>Model Fallback Activated</AlertTitle>
                <AlertDescription>
                  Due to rate limits, we used an alternative model.
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 border border-border rounded-md bg-card w-full">
              <h3 className="text-base font-medium mb-3">Search for Keywords</h3>
              <div className="space-y-4 w-full">
                <TopicAreaSelector 
                  value={topicArea}
                  onChange={setTopicArea}
                  disabled={isAISuggestionMode}
                />
                
                <div className="space-y-2">
                  <label htmlFor="target-url" className="text-sm font-medium">
                    Target URL (optional)
                  </label>
                  <input
                    id="target-url"
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="Enter target URL (optional)"
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={isAISuggestionMode}
                  />
                </div>
                
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

                <Button
                  onClick={handleAISuggestions}
                  disabled={isN8nLoading || !topicArea}
                  className="w-full relative overflow-hidden"
                  variant="default"
                >
                  <BrainCircuit className={isN8nLoading ? "invisible" : "mr-2"} size={16} />
                  <span className={isN8nLoading ? "invisible" : ""}>
                    AI Suggestions
                  </span>
                  {isN8nLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </Button>

                {isAISuggestionMode && (
                  <AIContentGenerator 
                    keywords={localKeywords}
                    topicArea={topicArea}
                    onSuggestionSelect={handleSuggestionSelect}
                    isLoading={isN8nLoading}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSuggestions;
