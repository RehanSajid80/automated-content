
import React, { useEffect, useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import KeywordResearchContent from "./KeywordResearchContent";
import { useKeywordData } from "@/hooks/useKeywordData";
import { useKeywordFilters } from "@/hooks/useKeywordFilters";
import { useSelectedKeywords } from "@/hooks/useSelectedKeywords";
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
          onToggleAdvanced={() => {}} // No-op since we're hiding advanced options
          showAdvanced={false}
        />
      </div>
      
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
