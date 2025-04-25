import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, SparklesIcon, BrainCircuit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import SemrushIntegration from "./SemrushIntegration";
import { KeywordSelector } from "./KeywordSelector";
import { useContentSuggestions } from "@/hooks/useContentSuggestions";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { AISuggestion } from "./types/aiSuggestions";
import { AISuggestionsList } from "./AISuggestionsList";

interface ContentSuggestionsProps {
  keywords: KeywordData[];
  className?: string;
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState<string>("");
  const [localKeywords, setLocalKeywords] = useState<KeywordData[]>(keywords);
  const [isN8nLoading, setIsN8nLoading] = useState(false);
  const [n8nResponse, setN8nResponse] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const { toast } = useToast();
  
  const {
    isLoading,
    apiError,
    usedModel,
    selectedModel,
    generateSuggestions
  } = useContentSuggestions();

  const { 
    sendToN8n, 
    isLoading: isN8nAgentLoading 
  } = useN8nAgent();

  useEffect(() => {
    setLocalKeywords(keywords);
    console.log(`ContentSuggestions: Keywords updated, got ${keywords.length} keywords`);
    setSelectedKeywords([]);
    setIsAISuggestionMode(false);
  }, [keywords]);

  const toggleKeywordSelection = (keyword: string) => {
    if (isAISuggestionMode) {
      return; // Prevent keyword selection in AI Suggestion mode
    }
    
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
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
    setSelectedKeywords([]); // Clear any previously selected keywords
    setN8nResponse([]);
    
    try {
      // For now, we'll use mock data instead of the actual API call
      const mockSuggestions: AISuggestion[] = Array.from({ length: 5 }).map((_, index) => ({
        id: `suggestion-${index + 1}`,
        title: `${topicArea} Content Idea ${index + 1}`,
        description: `AI-generated content idea based on your keywords and topic area: ${topicArea}`,
        contentType: ['pillar', 'support', 'meta', 'social'][Math.floor(Math.random() * 4)] as any,
        keywords: localKeywords.slice(0, 5).map(k => k.keyword),
      }));
      
      setAiSuggestions(mockSuggestions);
      
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
    
    // Here you would typically handle the selection, such as:
    // - Navigate to content creation with the selected suggestion
    // - Store the selection in state
    // - Trigger content generation, etc.
  };

  const autoSelectTrendingKeywords = () => {
    const trendingKeywords = localKeywords
      .filter(kw => kw.trend === "up")
      .map(kw => kw.keyword);
    
    setSelectedKeywords(trendingKeywords.slice(0, 5));
    
    toast({
      title: "Trending Keywords Selected",
      description: `Selected ${Math.min(trendingKeywords.length, 5)} trending keywords for analysis`,
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
                <div className="flex flex-col space-y-2">
                  <label htmlFor="topic-area" className="text-sm font-medium">
                    Topic Area <span className="text-red-500">*</span>
                  </label>
                  <Select value={topicArea} onValueChange={setTopicArea}>
                    <SelectTrigger 
                      id="topic-area" 
                      className={`w-full ${!topicArea ? 'border-red-300' : ''}`}
                      disabled={isAISuggestionMode}
                    >
                      <SelectValue placeholder="Select a topic area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workspace-management">Workspace Management</SelectItem>
                      <SelectItem value="office-analytics">Office Analytics</SelectItem>
                      <SelectItem value="desk-booking">Desk Booking</SelectItem>
                      <SelectItem value="workplace-technology">Workplace Technology</SelectItem>
                      <SelectItem value="facility-management">Facility Management</SelectItem>
                      <SelectItem value="asset-management">Asset Management</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the topic area for keyword analysis
                  </p>
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

                {isAISuggestionMode && aiSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
                    <AISuggestionsList 
                      suggestions={aiSuggestions}
                      onSelect={handleSuggestionSelect}
                      isLoading={isN8nLoading}
                    />
                  </div>
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
