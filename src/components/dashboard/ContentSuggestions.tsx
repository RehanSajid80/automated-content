
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AIContentGenerator } from "./AIContentGenerator";
import { useContentSuggestions } from "@/hooks/useContentSuggestions";
import { ContentSuggestionsProps, AISuggestion } from "./types/aiSuggestions";
import { ContentSuggestionsHeader } from "./content-suggestions/ContentSuggestionsHeader";
import { useContentSuggestionState } from "@/hooks/useContentSuggestionState";
import { TopicSuggestionForm } from "./content-suggestions/TopicSuggestionForm";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { StructuredContentSuggestions } from "./content-suggestions/StructuredContentSuggestions";
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
    selectedPersona,
    setSelectedPersona,
    selectedGoal,
    setSelectedGoal,
    customKeywords,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    addCustomKeyword,
    handleAISuggestions
  } = useContentSuggestionState(keywords);

  const { 
    isLoading, 
    apiError, 
    usedModel, 
    selectedModel,
    suggestions 
  } = useContentSuggestions();

  // Get generated content from N8N agent - this will receive the webhook response
  const { generatedContent, rawResponse, isLoading: isAgentLoading } = useN8nAgent();

  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    toast({
      title: "Suggestion Selected",
      description: `You selected: ${suggestion.title}`,
    });
  };

  // Process generated content for display
  const processContentForDisplay = (contentArray: any[]) => {
    if (!contentArray || contentArray.length === 0) return [];
    
    console.log("Processing content array for structured display:", contentArray);
    
    return contentArray.map(item => {
      const structuredItem: any = {
        topicArea: item.topicArea || topicArea || "Content Suggestions",
        pillarContent: [],
        supportPages: [],
        metaTags: [],
        socialMedia: [],
        email: [],
        reasoning: item.reasoning || {}
      };
      
      // Process pillar content
      if (item.pillarContent) {
        structuredItem.pillarContent = Array.isArray(item.pillarContent) 
          ? item.pillarContent 
          : [item.pillarContent];
      }
      
      // Process support content
      if (item.supportContent) {
        structuredItem.supportPages = Array.isArray(item.supportContent)
          ? item.supportContent
          : [item.supportContent];
      }
      
      // Process social media posts
      if (item.socialMediaPosts) {
        structuredItem.socialMedia = Array.isArray(item.socialMediaPosts)
          ? item.socialMediaPosts
          : [item.socialMediaPosts];
      }
      
      // Process email series
      if (item.emailSeries) {
        structuredItem.email = Array.isArray(item.emailSeries)
          ? item.emailSeries
          : [item.emailSeries];
      }
      
      return structuredItem;
    });
  };

  // Check if we have content to display
  const hasContent = Boolean(
    (rawResponse && typeof rawResponse === 'object') || 
    (generatedContent && generatedContent.length > 0)
  );

  const structuredSuggestions = hasContent ? 
    generatedContent && generatedContent.length > 0 
      ? processContentForDisplay(generatedContent) 
      : rawResponse 
        ? processContentForDisplay(Array.isArray(rawResponse) ? rawResponse : [rawResponse]) 
        : [] 
    : [];

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
            Use AI to analyze keywords and suggest content topics for your website
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
              isLoading={isN8nLoading || isLoading || isAgentLoading}
            />

            {/* Show structured content suggestions when available */}
            {hasContent && structuredSuggestions.length > 0 && (
              <StructuredContentSuggestions
                suggestions={structuredSuggestions}
                persona={selectedPersona}
                goal={selectedGoal}
                isLoading={false}
              />
            )}

            {/* Show traditional AI content generator if needed */}
            {isAISuggestionMode && !hasContent && (
              <>
                <AIContentGenerator 
                  keywords={localKeywords}
                  topicArea={topicArea}
                  onSuggestionSelect={handleSuggestionSelect}
                  isLoading={isN8nLoading || isLoading || isAgentLoading}
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
