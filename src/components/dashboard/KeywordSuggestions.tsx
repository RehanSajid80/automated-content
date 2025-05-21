
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContentSuggestion, ContentType } from "@/utils/contentSuggestionUtils";
import { AlertTriangle, FileText, Layout, MessageSquare, BookOpen, TrendingUp } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface KeywordSuggestionsProps {
  suggestions: ContentSuggestion[];
}

const SUGGESTIONS_PER_PAGE = 5;

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  pillar: <FileText className="h-4 w-4" />,
  blog: <MessageSquare className="h-4 w-4" />,
  guide: <BookOpen className="h-4 w-4" />,
  landing: <Layout className="h-4 w-4" />,
  social: <TrendingUp className="h-4 w-4" />
};

const contentTypeLabels: Record<ContentType, string> = {
  pillar: "Pillar Content",
  blog: "Blog Post",
  guide: "Guide",
  landing: "Landing Page",
  social: "Social Content"
};

const priorityColors = {
  high: "text-red-500 border-red-200 bg-red-50",
  medium: "text-orange-500 border-orange-200 bg-orange-50",
  low: "text-green-500 border-green-200 bg-green-50"
};

const KeywordSuggestions: React.FC<KeywordSuggestionsProps> = ({ suggestions }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!suggestions.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <p>No content suggestions available. Try selecting different keywords.</p>
      </div>
    );
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(suggestions.length / SUGGESTIONS_PER_PAGE);
  const paginatedSuggestions = suggestions.slice(
    (currentPage - 1) * SUGGESTIONS_PER_PAGE,
    currentPage * SUGGESTIONS_PER_PAGE
  );

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
    <div className="space-y-4">
      <div className="space-y-4">
        {paginatedSuggestions.map((suggestion, index) => (
          <Card key={index} className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{suggestion.keyword}</h3>
                <Badge 
                  variant="outline" 
                  className={priorityColors[suggestion.priority]}
                >
                  {suggestion.priority} priority
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {suggestion.contentTypes.map((type) => (
                  <Badge 
                    key={type}
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {contentTypeIcons[type]}
                    {contentTypeLabels[type]}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {suggestion.reason}
              </p>
            </div>
          </Card>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(curr => Math.max(1, curr - 1));
                    }} 
                  />
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
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(curr => Math.min(totalPages, curr + 1));
                    }} 
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default KeywordSuggestions;
