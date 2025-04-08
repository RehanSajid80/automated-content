
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions } from "@/utils/openaiUtils";
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
  SettingsIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ApiConnectionsManager from "../settings/ApiConnectionsManager";

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
  const { toast } = useToast();

  const toggleCard = (index: number) => {
    setOpenCards({
      ...openCards,
      [index]: !openCards[index],
    });
  };

  const generateSuggestions = async () => {
    const apiKey = getApiKey(API_KEYS.OPENAI);
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set up your OpenAI API connection",
        variant: "destructive",
      });
      setIsApiConnectionsOpen(true);
      return;
    }

    if (keywords.length === 0) {
      toast({
        title: "No Keywords",
        description: "Please upload or select keywords first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await getContentSuggestions(keywords);
      setSuggestions(results);
      toast({
        title: "Success",
        description: `Generated ${results.length} content topic suggestions`,
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const apiKeyInfo = getApiKeyInfo(API_KEYS.OPENAI);
  const hasApiKey = Boolean(apiKeyInfo?.key);

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

              {/* API Key Status Display */}
              {hasApiKey ? (
                <div className="bg-secondary/30 p-3 rounded-md flex items-center justify-between">
                  <div className="font-medium text-sm flex items-center">
                    <KeyIcon className="h-4 w-4 mr-2 text-primary" />
                    <span>{apiKeyInfo?.name || "OpenAI API"}</span>
                  </div>
                  <div className="text-green-600 text-xs font-medium flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-1.5"></span>
                    Connected
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
                Your API key is stored locally on your device and not sent to our servers
              </p>
            </div>

            <Button
              onClick={generateSuggestions}
              disabled={isLoading || keywords.length === 0 || !hasApiKey}
              className="w-full"
            >
              {isLoading
                ? "Generating Suggestions..."
                : `Generate Content Suggestions (${keywords.length} keywords)`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Connections Manager Dialog */}
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
