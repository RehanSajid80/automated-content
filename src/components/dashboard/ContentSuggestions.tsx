
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions } from "@/utils/openaiUtils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
}

interface ContentSuggestionsProps {
  className?: string;
  keywords: KeywordData[];
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ 
  className,
  keywords = [] 
}) => {
  const { toast } = useToast();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const storeContentInLibrary = async (suggestion: ContentSuggestion) => {
    try {
      const insertPromises = [
        ...suggestion.pillarContent.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'pillar',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        ),
        ...suggestion.supportPages.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'support',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        ),
        ...suggestion.metaTags.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'meta',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        ),
        ...suggestion.socialMedia.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'social',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        )
      ];

      const results = await Promise.allSettled(insertPromises);

      const successCount = results.filter(result => 
        result.status === 'fulfilled' && 
        result.value.data !== null
      ).length;

      const failedCount = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.error !== null)
      ).length;

      if (successCount > 0) {
        toast({
          title: "Content Stored Successfully",
          description: `Stored ${successCount} content items for "${suggestion.topicArea}"`,
          variant: successCount === insertPromises.length ? "default" : "destructive"
        });
      }

      if (failedCount > 0) {
        toast({
          title: "Partial Content Storage",
          description: `${failedCount} content items failed to store`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Comprehensive Error storing content:', error);
      toast({
        title: "Storage Error",
        description: "Failed to store content in library",
        variant: "destructive"
      });
    }
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const generateSuggestions = async () => {
    if (selectedKeywords.length === 0) {
      toast({
        title: "No Keywords Selected",
        description: "Please select at least one keyword to generate content suggestions",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setApiError(null);
    
    try {
      // Filter keywords to only the selected ones
      const selectedKeywordData = keywords.filter(kw => 
        selectedKeywords.includes(kw.keyword)
      );
      
      // Get content suggestions from OpenAI
      const contentSuggestions = await getContentSuggestions(selectedKeywordData);
      
      setSuggestions(contentSuggestions);
      
      toast({
        title: "Suggestions Generated",
        description: "Content suggestions have been created based on your keywords",
        variant: "default"
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setApiError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate content suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <h3 className="text-lg font-semibold mb-4">AI Content Suggestions</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Generate content ideas based on your keyword research
      </p>
      
      {keywords.length > 0 ? (
        <>
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Select Keywords</h4>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {keywords.map((keyword, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`keyword-${index}`}
                    checked={selectedKeywords.includes(keyword.keyword)}
                    onCheckedChange={() => handleKeywordToggle(keyword.keyword)}
                  />
                  <label 
                    htmlFor={`keyword-${index}`}
                    className="text-sm cursor-pointer"
                  >
                    {keyword.keyword}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end mb-6">
            <Button 
              onClick={generateSuggestions}
              disabled={isGenerating || selectedKeywords.length === 0}
            >
              {isGenerating ? 'Generating...' : 'Generate Suggestions'}
            </Button>
          </div>
          
          {apiError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Error</AlertTitle>
              <AlertDescription>
                {apiError}
              </AlertDescription>
            </Alert>
          )}
          
          {isGenerating && (
            <div className="space-y-4 mb-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          
          {!isGenerating && suggestions.length > 0 && (
            <div className="space-y-6">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-base mb-2">{suggestion.topicArea}</h4>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-1">Pillar Content</h5>
                    <ul className="list-disc pl-5 text-sm">
                      {suggestion.pillarContent.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-1">Support Pages</h5>
                    <ul className="list-disc pl-5 text-sm">
                      {suggestion.supportPages.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => storeContentInLibrary(suggestion)}
                    >
                      Save to Library
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <Alert>
          <AlertTitle>No Keywords Available</AlertTitle>
          <AlertDescription>
            Please load keywords from your research to generate content suggestions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ContentSuggestions;
