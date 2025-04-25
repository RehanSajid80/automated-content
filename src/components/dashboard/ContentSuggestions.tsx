
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
import { AlertTriangle, SparklesIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import SemrushIntegration from "./SemrushIntegration";
import { KeywordSelector } from "./KeywordSelector";
import { useContentSuggestions } from "@/hooks/useContentSuggestions";

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
  const { toast } = useToast();
  
  const {
    isLoading,
    apiError,
    usedModel,
    selectedModel,
    generateSuggestions
  } = useContentSuggestions();

  useEffect(() => {
    setLocalKeywords(keywords);
    console.log(`ContentSuggestions: Keywords updated, got ${keywords.length} keywords`);
    setSelectedKeywords([]);
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
                    Topic Area
                  </label>
                  <Select value={topicArea} onValueChange={setTopicArea}>
                    <SelectTrigger id="topic-area" className="w-full">
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
                />
                
                <KeywordSelector
                  keywords={localKeywords}
                  selectedKeywords={selectedKeywords}
                  onKeywordToggle={toggleKeywordSelection}
                  onAutoSelect={autoSelectTrendingKeywords}
                />

                <Button
                  onClick={() => generateSuggestions(localKeywords, selectedKeywords)}
                  disabled={isLoading || selectedKeywords.length === 0}
                  className="w-full relative overflow-hidden"
                >
                  <span className={isLoading ? "invisible" : ""}>
                    {`Generate Content Suggestions (${selectedKeywords.length} keywords)`}
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSuggestions;
