
import React from "react";
import { KeywordData } from "@/utils/excelUtils";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2 } from "lucide-react";
import KeywordFilters, { FilterOptions } from "./KeywordFilters";
import KeywordList from "./KeywordList";
import KeywordContentSuggestions from "./KeywordContentSuggestions";
import { AIContentStrategyPanel } from "./AIContentStrategyPanel";
import { useAIContentStrategy } from "@/hooks/useAIContentStrategy";

interface KeywordResearchContentProps {
  filteredKeywords: KeywordData[];
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
  onGenerateContent: (keywords: string[]) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  topicArea?: string;
  domain?: string;
}

const KeywordResearchContent: React.FC<KeywordResearchContentProps> = ({
  filteredKeywords,
  selectedKeywords,
  onKeywordToggle,
  onGenerateContent,
  onFiltersChange,
  topicArea = "",
  domain = ""
}) => {
  const { 
    isLoading: isStrategyLoading, 
    recommendations, 
    generateContentStrategy, 
    clearRecommendations 
  } = useAIContentStrategy();

  const handleGenerateStrategy = () => {
    if (filteredKeywords.length === 0) return;
    generateContentStrategy(filteredKeywords, topicArea, domain);
  };

  const handleSelectPriorityKeywords = (keywords: string[]) => {
    // Clear current selections and select the AI recommended keywords
    keywords.forEach(keyword => {
      if (!selectedKeywords.includes(keyword)) {
        onKeywordToggle(keyword);
      }
    });
  };

  const handleCreateContentFromStrategy = (keywords: string[]) => {
    // First select the keywords
    handleSelectPriorityKeywords(keywords);
    // Then trigger content generation
    onGenerateContent(keywords);
  };

  return (
    <>
      {/* AI Content Strategy Section */}
      {filteredKeywords.length > 0 && !recommendations && (
        <div className="mb-6 p-4 border border-border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-medium">Get AI Content Strategy</h3>
                <p className="text-sm text-muted-foreground">
                  Let AI analyze your keywords and suggest the best content strategy for office space software
                </p>
              </div>
            </div>
            <Button 
              onClick={handleGenerateStrategy}
              disabled={isStrategyLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isStrategyLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Get AI Strategy
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* AI Recommendations Panel */}
      {recommendations && (
        <div className="mb-6">
          <AIContentStrategyPanel
            recommendations={recommendations}
            onClose={clearRecommendations}
            onKeywordSelect={handleSelectPriorityKeywords}
            onCreateContent={handleCreateContentFromStrategy}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <KeywordList
              keywords={filteredKeywords}
              selectedKeywords={selectedKeywords}
              onKeywordToggle={onKeywordToggle}
              onGenerateContent={onGenerateContent}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <KeywordFilters onFiltersChange={onFiltersChange} />
        </div>
      </div>
      
      <KeywordContentSuggestions keywords={filteredKeywords} />
    </>
  );
};

export default KeywordResearchContent;
