
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions } from "@/utils/openaiUtils";
import { useToast } from "@/hooks/use-toast";
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
import { ChevronDown, ChevronUp, FileText, Tag, MessageSquare, PenTool } from "lucide-react";

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
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [openCards, setOpenCards] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const toggleCard = (index: number) => {
    setOpenCards({
      ...openCards,
      [index]: !openCards[index],
    });
  };

  const generateSuggestions = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
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
      const results = await getContentSuggestions(keywords, apiKey);
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
              <label className="text-sm font-medium mb-1 block">
                OpenAI API Key
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your OpenAI API key"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is used only for this request and not stored
              </p>
            </div>
            <Button
              onClick={generateSuggestions}
              disabled={isLoading || keywords.length === 0}
              className="w-full"
            >
              {isLoading
                ? "Generating Suggestions..."
                : `Generate Content Suggestions (${keywords.length} keywords)`}
            </Button>
          </div>
        </CardContent>
      </Card>

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
