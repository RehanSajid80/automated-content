
import React, { useState } from "react";
import { TopicAreaSelector } from "../TopicAreaSelector";
import SemrushIntegration from "../SemrushIntegration";
import { KeywordSelector } from "../KeywordSelector";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KeywordSearchSectionProps {
  topicArea: string;
  setTopicArea: (area: string) => void;
  updateKeywords: (keywords: KeywordData[]) => void;
  localKeywords: KeywordData[];
  selectedKeywords: string[];
  toggleKeywordSelection: (keyword: string) => void;
  autoSelectTrendingKeywords: () => void;
  isAISuggestionMode: boolean;
  customKeywords?: string[];
  addCustomKeyword?: (keyword: string) => void;
}

export const KeywordSearchSection: React.FC<KeywordSearchSectionProps> = ({
  topicArea,
  setTopicArea,
  updateKeywords,
  localKeywords,
  selectedKeywords,
  toggleKeywordSelection,
  autoSelectTrendingKeywords,
  isAISuggestionMode,
  customKeywords = [],
  addCustomKeyword = () => {}
}) => {
  const { toast } = useToast();
  const [customKeyword, setCustomKeyword] = useState("");

  const handleKeywordsReceived = (keywords: KeywordData[]) => {
    if (keywords && keywords.length > 0) {
      console.log(`KeywordSearchSection received ${keywords.length} keywords`);
      updateKeywords(keywords);
      toast({
        title: "Keywords Updated",
        description: `Added ${keywords.length} keywords for analysis`,
      });
    } else {
      console.warn("Received empty keywords array");
    }
  };

  const handleAddCustomKeyword = () => {
    if (!customKeyword.trim()) return;
    
    addCustomKeyword(customKeyword.trim());
    setCustomKeyword("");
    
    toast({
      title: "Custom Keyword Added",
      description: `Added "${customKeyword}" to your keywords list`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomKeyword();
    }
  };

  return (
    <div className="p-4 border border-border rounded-md bg-card w-full">
      <h3 className="text-base font-medium mb-3">Search for Keywords</h3>
      <div className="space-y-4 w-full">
        <TopicAreaSelector 
          value={topicArea}
          onChange={setTopicArea}
          disabled={isAISuggestionMode}
        />
        
        <SemrushIntegration 
          onKeywordsReceived={handleKeywordsReceived} 
          topicArea={topicArea}
          disabled={isAISuggestionMode}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Add Custom Keywords</label>
          <div className="flex gap-2">
            <Input
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="Enter your own keyword..."
              onKeyPress={handleKeyPress}
              disabled={isAISuggestionMode}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddCustomKeyword}
              disabled={!customKeyword.trim() || isAISuggestionMode}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {customKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customKeywords.map((keyword, index) => (
                <Badge key={`custom-${index}`} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <KeywordSelector
          keywords={localKeywords}
          selectedKeywords={selectedKeywords}
          onKeywordToggle={toggleKeywordSelection}
          onAutoSelect={autoSelectTrendingKeywords}
          disabled={isAISuggestionMode}
        />
      </div>
    </div>
  );
};
