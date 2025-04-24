import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions, OPENAI_MODELS } from "@/utils/openaiUtils";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, getApiKeyInfo, ApiKeyInfo } from "@/utils/apiKeyUtils";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ApiConnectionsManager from "../settings/ApiConnectionsManager";
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

interface N8nContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [openCards, setOpenCards] = useState<{ [key: string]: boolean }>({});
  const [isApiConnectionsOpen, setIsApiConnectionsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(OPENAI_MODELS.PREMIUM);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const [checkingSupabase, setCheckingSupabase] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setUsingSupabase(!error);
        setCheckingSupabase(false);
      } catch (error) {
        setUsingSupabase(false);
        setCheckingSupabase(false);
      }
    };
    
    const savedWebhookUrl = localStorage.getItem('n8n-content-suggestions-webhook-url');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
    
    checkSupabaseConnection();
  }, []);

  useEffect(() => {
    if (keywords.length > 0) {
      const trendingKeywords = keywords
        .filter(kw => kw.trend === "up")
        .map(kw => kw.keyword);
      
      setSelectedKeywords(trendingKeywords.slice(0, 5));
    }
  }, [keywords]);

  const toggleCard = (index: number) => {
    setOpenCards({
      ...openCards,
      [index]: !openCards[index],
    });
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
      setIsApiConnectionsOpen(true);
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

  const handleKeywordsReceived = (newKeywords: KeywordData[]) => {
    if (newKeywords && newKeywords.length > 0) {
      setSearchedKeywords(newKeywords);
      setSelectedKeywords(newKeywords.slice(0, 5).map(kw => kw.keyword));
      
      toast({
        title: "Keywords Loaded",
        description: `Loaded ${newKeywords.length} keywords for analysis`,
      });
    }
  };

  const checkApiKeyAvailability = async () => {
    try {
      const keyInfo = await getApiKeyInfo(API_KEYS.OPENAI);
      if (keyInfo?.key) {
        setHasApiKey(true);
        setApiKeyInfo(keyInfo);
      }
      return Boolean(keyInfo?.key);
    } catch (error) {
      console.error("Error checking API key availability:", error);
      return false;
    }
  };

  useEffect(() => {
    checkApiKeyAvailability().then(setHasApiKey);
  }, []);

  const getModelDisplayName = (modelKey: string) => {
    switch(modelKey) {
      case OPENAI_MODELS.PREMIUM:
        return "GPT-4o (Premium)";
      case OPENAI_MODELS.STANDARD:
        return "GPT-4o-mini (Standard)";
      case OPENAI_MODELS.FALLBACK:
        return "GPT-3.5 Turbo (Basic)";
      default:
        return modelKey;
    }
  };

  const storeContentInLibrary = async (suggestion: ContentSuggestion | N8nContentSuggestion) => {
    try {
      console.log("Storing content in library:", suggestion);
      const insertPromises = [];
      
      for (const content of suggestion.pillarContent) {
        console.log("Inserting pillar content:", content);
        insertPromises.push(
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'pillar',
            content: content,
            title: content,
            reasoning: suggestion.reasoning,
            keywords: selectedKeywords
          })
        );
      }

      for (const content of suggestion.supportPages) {
        console.log("Inserting support page:", content);
        insertPromises.push(
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'support',
            content: content,
            title: content,
            reasoning: suggestion.reasoning,
            keywords: selectedKeywords
          })
        );
      }

      for (const content of suggestion.metaTags) {
        console.log("Inserting meta tag:", content);
        insertPromises.push(
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'meta',
            content: content,
            title: content,
            reasoning: suggestion.reasoning,
            keywords: selectedKeywords
          })
        );
      }

      for (const content of suggestion.socialMedia) {
        console.log("Inserting social media content:", content);
        insertPromises.push(
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'social',
            content: content,
            title: content,
            reasoning: suggestion.reasoning,
            keywords: selectedKeywords
          })
        );
      }

      console.log("Executing insert promises...");
      const results = await Promise.all(insertPromises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors storing content:', errors);
        errors.forEach((err, index) => {
          console.error(`Error ${index + 1}:`, err.error);
        });
        throw new Error(`Failed to store ${errors.length} content items`);
      }

      window.dispatchEvent(new CustomEvent('navigate-to-content', { 
        detail: { topicArea: suggestion.topicArea } 
      }));

      toast({
        title: "Content Stored",
        description: `Successfully stored content for "${suggestion.topicArea}"`,
      });
      
      window.dispatchEvent(new CustomEvent('content-updated'));
      
    } catch (error) {
      console.error('Error storing content:', error);
      toast({
        title: "Storage Error",
        description: `Failed to store content in library: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
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
                  Due to rate limits, we used {getModelDisplayName(usedModel)} instead of {getModelDisplayName(selectedModel)}.
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 border border-border rounded-md bg-card">
              <h3 className="text-base font-medium mb-3">Search for Keywords</h3>
              <div className="space-y-4">
                <SemrushIntegration onKeywordsReceived={handleKeywordsReceived} />
                
                {searchedKeywords.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Top Keywords ({searchedKeywords.length})</h4>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/50">
                          <tr>
                            <th className="text-left p-2">Keyword</th>
                            <th className="text-right p-2">Volume</th>
                            <th className="text-right p-2">Difficulty</th>
                            <th className="text-center p-2">Select</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {searchedKeywords.map((kw, idx) => (
                            <tr key={idx} className="hover:bg-secondary/30">
                              <td className="p-2">{kw.keyword}</td>
                              <td className="text-right p-2">{kw.volume.toLocaleString()}</td>
                              <td className="text-right p-2">{kw.difficulty}</td>
                              <td className="text-center p-2">
                                <Checkbox 
                                  checked={selectedKeywords.includes(kw.keyword)}
                                  onCheckedChange={() => toggleKeywordSelection(kw.keyword)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                  OpenAI API Connection
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsApiConnectionsOpen(true)}
                  className="h-8"
                >
                  <SettingsIcon className="h-4 w-4 mr-1.5" />
                  Manage Connections
                </Button>
              </div>

              {hasApiKey ? (
                <div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-center justify-between">
                  <div className="font-medium text-sm flex items-center">
                    <KeyIcon className="h-5 w-5 mr-2 text-green-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span>OpenAI API Connected</span>
                        {apiKeyInfo?.name && (
                          <Badge variant="secondary" className="text-xs">
                            {apiKeyInfo.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {apiKeyInfo?.lastUpdated 
                          ? new Date(apiKeyInfo.lastUpdated).toLocaleString() 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-700 text-xs font-medium flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-1.5"></span>
                    Active
                  </div>
                </div>
              ) : (
                <div 
                  className="bg-secondary/30 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-secondary/50"
                  onClick={() => setIsApiConnectionsOpen(true)}
                >
                  <div className="text-muted-foreground flex items-center">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    <span>Set up your OpenAI API connection</span>
                  </div>
                  <Button size="sm" variant="secondary" className="h-7 text-xs">
                    Set Up
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {usingSupabase 
                  ? "Your API key is securely stored in Supabase" 
                  : "Your API key is stored locally on your device"}
              </p>
            </div>
            
            <div>
              <label htmlFor="model-select" className="text-sm font-medium block mb-2">
                OpenAI Model
              </label>
              <Select 
                value={selectedModel} 
                onValueChange={setSelectedModel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OPENAI_MODELS.PREMIUM}>
                    GPT-4o (Premium) - Most powerful
                  </SelectItem>
                  <SelectItem value={OPENAI_MODELS.STANDARD}>
                    GPT-4o-mini (Standard) - Good balance
                  </SelectItem>
                  <SelectItem value={OPENAI_MODELS.FALLBACK}>
                    GPT-3.5 Turbo (Basic) - Most economical
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                The system will automatically fall back to more economical models if rate limits are hit
              </p>
            </div>

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
              
              {keywords.length === 0 && searchedKeywords.length === 0 ? (
                <div className="bg-secondary/30 p-3 rounded-md text-muted-foreground text-sm">
                  No keywords available. Please search for keywords using the domain search above or add keywords from the Keyword Research tab.
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                  {(searchedKeywords.length > 0 ? searchedKeywords : keywords).map((kw, idx) => (
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
              disabled={isLoading || selectedKeywords.length === 0 || !hasApiKey}
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
        </CardContent>
      </Card>

      <Dialog open={isApiConnectionsOpen} onOpenChange={setIsApiConnectionsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>API Connections</DialogTitle>
            <DialogDescription>
              Manage your API connections for integration with external services
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ApiConnectionsManager />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentSuggestions;
