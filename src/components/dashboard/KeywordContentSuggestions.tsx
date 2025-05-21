
import React, { useMemo, useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import KeywordSuggestions from "./KeywordSuggestions";
import { analyzeKeywords } from "@/utils/contentSuggestionUtils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface KeywordContentSuggestionsProps {
  keywords: KeywordData[];
}

const SUGGESTIONS_PER_PAGE = 5;

const KeywordContentSuggestions: React.FC<KeywordContentSuggestionsProps> = ({ keywords }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const suggestions = useMemo(() => {
    return analyzeKeywords(keywords);
  }, [keywords]);

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
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Content Suggestions</h3>
        <KeywordSuggestions suggestions={paginatedSuggestions} />
        
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
    </div>
  );
};

export default KeywordContentSuggestions;
