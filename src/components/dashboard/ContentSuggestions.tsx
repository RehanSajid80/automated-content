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

  const handleN8nSuggestions = async () => {
    if (selectedKeywords.length === 0) {
      toast({
        title: "No Keywords Selected",
        description: "Please select at least one keyword for suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsN8nLoading(true);
    setN8nResponse([]);
    
    try {
      const filteredKeywords = localKeywords.filter(kw => 
        selectedKeywords.includes(kw.keyword)
      );
      
      const webhookUrl = localStorage.getItem("n8n-webhook-url") || 
                         localStorage.getItem("semrush-webhook-url");

      if (!webhookUrl) {
        toast({
          title: "Webhook URL Missing",
          description: "Please configure the n8n webhook URL in API Connections settings",
          variant: "destructive",
        });
        setIsN8nLoading(false);
        return;
      }
      
      const targetUrl = localStorage.getItem("target-url") || "https://officespacesoftware.com";
      
      const response = await sendToN8n({
        keywords: filteredKeywords,
        topicArea,
        targetUrl,
        requestType: "contentSuggestions"
      });
      
      if (!response || !response.suggestions || !Array.isArray(response.suggestions)) {
        throw new Error("Invalid response from n8n agent");
      }
      
      setN8nResponse(response.suggestions);
      
      toast({
        title: "AI Suggestions Received",
        description: `Received ${response.suggestions.length} content suggestions from the AI agent`,
      });
      
      if (response.suggestions.length > 0) {
        const event = new CustomEvent('navigate-to-tab', { 
          detail: { 
            tab: 'content',
            contentSuggestions: response.suggestions,
            sourceKeywords: selectedKeywords
          } 
        });
        window.dispatchEvent(event);
      }
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

                <div className="flex flex-col sm:flex-row gap-3">
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
                  
                  <Button
                    onClick={handleN8nSuggestions}
                    disabled={isN8nLoading || isN8nAgentLoading || selectedKeywords.length === 0}
                    className="w-full sm:w-auto relative overflow-hidden"
                    variant="n8n"
                  >
                    <BrainCircuit className={isN8nLoading ? "invisible" : "mr-2"} size={16} />
                    <span className={isN8nLoading ? "invisible" : ""}>
                      AI Suggestions
                    </span>
                    {(isN8nLoading || isN8nAgentLoading) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSuggestions;
