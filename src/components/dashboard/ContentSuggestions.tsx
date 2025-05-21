
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AIContentGenerator } from "./AIContentGenerator";
import { useContentSuggestions } from "@/hooks/useContentSuggestions";
import { ContentSuggestionsProps, AISuggestion } from "./types/aiSuggestions";
import { ContentSuggestionsHeader } from "./content-suggestions/ContentSuggestionsHeader";
import { useContentSuggestionState } from "@/hooks/useContentSuggestionState";
import { TopicSuggestionForm } from "./content-suggestions/TopicSuggestionForm";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const SUGGESTIONS_PER_PAGE = 5;

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    selectedKeywords,
    topicArea,
    setTopicArea,
    localKeywords,
    isN8nLoading,
    isAISuggestionMode,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    handleAISuggestions
  } = useContentSuggestionState(keywords);

  const { 
    isLoading, 
    apiError, 
    usedModel, 
    selectedModel,
    suggestions 
  } = useContentSuggestions();

  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    toast({
      title: "Suggestion Selected",
      description: `You selected: ${suggestion.title}`,
    });
  };

  // Calculate pagination for suggestions
  const totalPages = suggestions && suggestions.length > 0 
    ? Math.ceil(suggestions.length / SUGGESTIONS_PER_PAGE) 
    : 0;
    
  const paginatedSuggestions = suggestions && suggestions.length > 0 
    ? suggestions.slice(
        (currentPage - 1) * SUGGESTIONS_PER_PAGE, 
        currentPage * SUGGESTIONS_PER_PAGE
      ) 
    : [];

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!totalPages) return [];
    
    const pages = [];
    
    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }
    
    // Add current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pages[pages.length - 1] !== i - 1) {
        // Add ellipsis if there's a gap
        pages.push(-1);
      }
      pages.push(i);
    }
    
    // Add last page if needed
    if (totalPages > 1) {
      if (pages[pages.length - 1] !== totalPages - 1) {
        // Add ellipsis if there's a gap
        pages.push(-1);
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className={`space-y-4 w-full ${className}`}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Content Suggestions</CardTitle>
          <CardDescription>
            Use OpenAI to analyze keywords and suggest content topics for your website
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="space-y-6 w-full">
            <ContentSuggestionsHeader 
              apiError={apiError}
              usedModel={usedModel}
              selectedModel={selectedModel}
            />
            
            <TopicSuggestionForm
              topicArea={topicArea}
              setTopicArea={setTopicArea}
              updateKeywords={updateKeywords}
              localKeywords={localKeywords}
              selectedKeywords={selectedKeywords}
              toggleKeywordSelection={toggleKeywordSelection}
              autoSelectTrendingKeywords={autoSelectTrendingKeywords}
              isAISuggestionMode={isAISuggestionMode}
              handleAISuggestions={handleAISuggestions}
              isLoading={isN8nLoading || isLoading}
            />

            {isAISuggestionMode && (
              <>
                <AIContentGenerator 
                  keywords={localKeywords}
                  topicArea={topicArea}
                  onSuggestionSelect={handleSuggestionSelect}
                  isLoading={isN8nLoading || isLoading}
                  suggestions={paginatedSuggestions}
                />
                
                {/* Pagination for AI Suggestions */}
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(curr => Math.max(1, curr - 1));
                          }} />
                        </PaginationItem>
                      )}
                      
                      {getPageNumbers().map((page, i) => (
                        page === -1 ? (
                          <PaginationItem key={`ellipsis-${i}`}>
                            <span className="flex h-9 w-9 items-center justify-center">...</span>
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={`page-${page}`}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(curr => Math.min(totalPages, curr + 1));
                          }} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentSuggestions;
