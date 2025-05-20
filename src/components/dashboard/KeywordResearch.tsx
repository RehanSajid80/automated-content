
import React, { useEffect } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import KeywordToolbar from "./KeywordToolbar";
import KeywordResearchContent from "./KeywordResearchContent";
import { useKeywordData } from "@/hooks/useKeywordData";
import { useKeywordFilters } from "@/hooks/useKeywordFilters";
import { useSelectedKeywords } from "@/hooks/useSelectedKeywords";
import { useN8nSync } from "@/hooks/useN8nSync";

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

  // Initialize from URL search param only once on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchFromUrl = searchParams.get('search');
    
    if (searchFromUrl) {
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

  const handleSemrushKeywords = (newKeywords: KeywordData[]) => {
    if (newKeywords && newKeywords.length > 0) {
      console.log(`KeywordResearch received ${newKeywords.length} keywords from SEMrush`);
      
      // Update keywords without changing search term
      updateKeywords(newKeywords);
      
      // Show toast notification for better UX
      toast({
        title: "Keywords Updated",
        description: `${newKeywords.length} keywords loaded from SEMrush`,
      });
    }
  };

  return (
    <div className={className}>
      <KeywordToolbar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchInputChange}
        onClearData={clearKeywords}
        onSemrushKeywords={handleSemrushKeywords}
        isSyncingFromN8n={isSyncingFromN8n}
        onN8nSync={handleN8nSync}
      />
      
      <KeywordResearchContent
        filteredKeywords={filteredKeywords}
        selectedKeywords={selectedKeywords}
        onKeywordToggle={toggleKeywordSelection}
        onGenerateContent={handleGenerateContent}
        onFiltersChange={handleFilterChange}
      />
    </div>
  );
};

export default KeywordResearch;
