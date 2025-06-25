
import React, { useEffect, useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import KeywordToolbar from "./KeywordToolbar";
import KeywordResearchContent from "./KeywordResearchContent";
import { useKeywordData } from "@/hooks/useKeywordData";
import { useKeywordFilters } from "@/hooks/useKeywordFilters";
import { useSelectedKeywords } from "@/hooks/useSelectedKeywords";
import { useN8nSync } from "@/hooks/useN8nSync";
import TopicKeywordFetcher from "./TopicKeywordFetcher";

interface KeywordResearchProps {
  className?: string;
  onKeywordsSelected?: (keywords: string[]) => void;
  onKeywordDataUpdate?: (data: KeywordData[]) => void;
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({ 
  className,
  onKeywordsSelected,
  onKeywordDataUpdate
}) => {
  const { toast } = useToast();
  const { keywords, updateKeywords, clearKeywords } = useKeywordData(onKeywordDataUpdate);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentTopicArea, setCurrentTopicArea] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  
  // Custom hooks
  const { 
    searchTerm, 
    filterOptions, 
    filteredKeywords, 
    handleFilterChange, 
    handleSearchInputChange 
  } = useKeywordFilters(keywords);
  
  const { selectedKeywords, toggleKeywordSelection } = useSelectedKeywords(keywords);
  const { isSyncingFromN8n, handleN8nSync } = useN8nSync(updateKeywords);

  // Debug logging for the main component
  useEffect(() => {
    console.log("KeywordResearch: Component state:", {
      totalKeywords: keywords.length,
      filteredKeywords: filteredKeywords.length,
      searchTerm,
      selectedKeywords: selectedKeywords.length
    });
  }, [keywords.length, filteredKeywords.length, searchTerm, selectedKeywords.length]);

  // Initialize from URL search param only once on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchFromUrl = searchParams.get('search');
    
    if (searchFromUrl) {
      console.log("KeywordResearch: Setting search from URL:", searchFromUrl);
      handleSearchInputChange({ 
        target: { value: searchFromUrl } 
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, []);

  const handleGenerateContent = (keywords: string[]) => {
    if (onKeywordsSelected) {
      onKeywordsSelected(keywords);
      
      const event = new CustomEvent('navigate-to-tab', { 
        detail: { tab: 'content' } 
      });
      window.dispatchEvent(event);
      
      toast({
        title: "Keywords transferred",
        description: `${keywords.length} keywords sent to Content Generator`,
      });
    }
  };

  const handleTopicKeywords = (newKeywords: KeywordData[], topicArea?: string, domain?: string) => {
    if (newKeywords && newKeywords.length > 0) {
      console.log(`KeywordResearch received ${newKeywords.length} keywords from topic search`);
      updateKeywords(newKeywords);
      
      // Store the topic area and domain for AI strategy
      if (topicArea) setCurrentTopicArea(topicArea);
      if (domain) setCurrentDomain(domain);
      
      toast({
        title: "Keywords Loaded",
        description: `Found ${newKeywords.length} keywords for your topic`,
      });
    }
  };

  return (
    <div className={className}>
      {/* Topic-based keyword fetcher - main workflow */}
      <div className="mb-6">
        <TopicKeywordFetcher 
          onKeywordsReceived={handleTopicKeywords}
          onToggleAdvanced={() => setShowAdvancedSearch(!showAdvancedSearch)}
          showAdvanced={showAdvancedSearch}
        />
      </div>

      {/* Advanced search options - hidden by default */}
      {showAdvancedSearch && (
        <div className="mb-6 border-t pt-6">
          <KeywordToolbar 
            searchTerm={searchTerm}
            onSearchChange={handleSearchInputChange}
            onClearData={clearKeywords}
            onSemrushKeywords={handleTopicKeywords}
            isSyncingFromN8n={isSyncingFromN8n}
            onN8nSync={handleN8nSync}
          />
        </div>
      )}
      
      {/* Results and content generation */}
      {keywords.length > 0 && (
        <KeywordResearchContent
          filteredKeywords={filteredKeywords}
          selectedKeywords={selectedKeywords}
          onKeywordToggle={toggleKeywordSelection}
          onGenerateContent={handleGenerateContent}
          onFiltersChange={handleFilterChange}
          topicArea={currentTopicArea}
          domain={currentDomain}
        />
      )}
    </div>
  );
};

export default KeywordResearch;
