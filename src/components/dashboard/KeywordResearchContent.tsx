
import React from "react";
import { KeywordData } from "@/utils/excelUtils";
import KeywordFilters, { FilterOptions } from "./KeywordFilters";
import KeywordList from "./KeywordList";
import KeywordContentSuggestions from "./KeywordContentSuggestions";

interface KeywordResearchContentProps {
  filteredKeywords: KeywordData[];
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
  onGenerateContent: (keywords: string[]) => void;
  onFiltersChange: (filters: FilterOptions) => void;
}

const KeywordResearchContent: React.FC<KeywordResearchContentProps> = ({
  filteredKeywords,
  selectedKeywords,
  onKeywordToggle,
  onGenerateContent,
  onFiltersChange
}) => {
  return (
    <>
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
