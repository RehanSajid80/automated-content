
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions, OPENAI_MODELS } from "@/utils/openaiUtils";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey } from "@/utils/apiKeyUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Tag, 
  MessageSquare, 
  PenTool,
  KeyIcon,
  RefreshCwIcon,
  SettingsIcon,
  AlertTriangleIcon,
  SparklesIcon,
  CheckSquare2Icon,
  TrendingUpIcon,
  TrendingUp,
  Search,
  Database
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import SemrushIntegration from "./SemrushIntegration";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
  searchAnalysis?: {
    totalVolume?: number;
    averageDifficulty?: number;
    trendingKeywords?: string[];
    competitiveLandscape?: string;
  };
}

interface ContentSuggestionsProps {
  keywords: KeywordData[];
  className?: string;
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [openCards, setOpenCards] = useState<{ [key: string]: boolean }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(OPENAI_MODELS.PREMIUM);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState<string>("");
  const [isSyncingFromN8n, setIsSyncingFromN8n] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (keywords.length > 0) {
      const trendingKeywords = keywords
        .filter(kw => kw.trend === "up")
        .map(kw => kw.keyword);
      
      setSelectedKeywords(trendingKeywords.slice(0, 5));
    }
  }, [keywords]);

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const autoSelectTrendingKeywords = () => {
    const trendingKeywords = keywords
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
      toast({
        title: "Keywords Updated",
        description: `Added ${newKeywords.length} keywords for analysis`,
      });
    }
  };

  const generateSuggestions = async () => {
    let apiKey = null;
    
    try {
      apiKey = await getApiKey(API_KEYS.OPENAI);
    } catch (error) {
      console.error("Error getting API key:", error);
    }
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set up your OpenAI API connection",
        variant: "destructive",
      });
      return;
    }

    if (selectedKeywords.length === 0) {
      toast({
        title: "No Keywords Selected",
        description: "Please select at least one keyword for suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setUsedModel(null);
    
    try {
      const filteredKeywords = keywords.filter(kw => 
        selectedKeywords.includes(kw.keyword)
      );
      
      console.log("Generating content for keywords:", filteredKeywords);
      const results = await getContentSuggestions(filteredKeywords, undefined, selectedModel);
      setSuggestions(results);
      
      setUsedModel(selectedModel);
      
      if (results.length > 0) {
        setOpenCards({ 0: true });
      }
      
      toast({
        title: "Success",
        description: `Generated ${results.length} content topic suggestions`,
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>AI Content Suggestions</CardTitle>
          <CardDescription>
            Use OpenAI to analyze keywords and suggest content topics for your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {apiError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangleIcon className="h-4 w-4" />
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

            <div className="p-4 border border-border rounded-md bg-card">
              <h3 className="text-base font-medium mb-3">Search for Keywords</h3>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="topic-area" className="text-sm font-medium">
                    Topic Area
                  </label>
                  <Select value={topicArea} onValueChange={setTopicArea}>
                    <SelectTrigger id="topic-area">
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
                
                <SemrushIntegration onKeywordsReceived={updateKeywords} />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Select Keywords for Analysis
                    </label>
                    {keywords.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={autoSelectTrendingKeywords}
                          className="text-xs flex items-center gap-1"
                        >
                          <TrendingUpIcon className="h-3 w-3" />
                          Auto-select Trending
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          {selectedKeywords.length} of {keywords.length} selected
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {keywords.length === 0 ? (
                    <div className="bg-secondary/30 p-3 rounded-md text-muted-foreground text-sm">
                      No keywords available. Please search for keywords using the domain search above or add keywords from the Keyword Research tab.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {keywords.map((kw, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`kw-${idx}`} 
                            checked={selectedKeywords.includes(kw.keyword)}
                            onCheckedChange={() => toggleKeywordSelection(kw.keyword)}
                          />
                          <label 
                            htmlFor={`kw-${idx}`}
                            className="text-sm cursor-pointer flex items-center"
                          >
                            {kw.keyword}
                            {kw.trend === "up" && (
                              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                                <TrendingUpIcon className="h-3 w-3" />
                                Trending
                              </Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={generateSuggestions}
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
