import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions, OPENAI_MODELS } from "@/utils/openaiUtils";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, getApiKeyInfo } from "@/utils/apiKeyUtils";
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
  TrendingUpIcon
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
import { supabase } from "@/integrations/supabase/client";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
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

  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
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

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>AI Content Suggestions</CardTitle>
          <CardDescription>
            Use OpenAI to analyze your keywords and suggest content topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
              
              {keywords.length === 0 ? (
                <div className="bg-secondary/30 p-3 rounded-md text-muted-foreground text-sm">
                  No keywords available. Please add keywords from the Keyword Research tab.
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
              disabled={isLoading || selectedKeywords.length === 0 || !hasApiKey}
              className="w-full"
            >
              {isLoading
                ? "Generating Suggestions..."
                : `Generate Content Suggestions (${selectedKeywords.length} keywords)`}
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

      {suggestions.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Content Topic Suggestions</h3>
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{suggestion.topicArea}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCard(index)}
                  >
                    {openCards[index] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <CardDescription>{suggestion.reasoning}</CardDescription>
              </CardHeader>
              <Collapsible open={openCards[index]} className="w-full">
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">Pillar Content</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.pillarContent.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <PenTool className="h-4 w-4 text-orange-500" />
                          <h4 className="font-medium">Support Pages</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.supportPages.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Meta Tags</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.metaTags.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Social Media</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.socialMedia.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => {
                        toast({
                          title: "Content Selected",
                          description: `Content topic "${suggestion.topicArea}" selected for creation`,
                        });
                      }}
                    >
                      <CheckSquare2Icon className="h-4 w-4 mr-2" />
                      Use This Content
                    </Button>
                  </CardFooter>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentSuggestions;
