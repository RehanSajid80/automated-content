
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ContentRefreshManager from "./ContentViewRefreshManager";
import ContentFilter from "./library/ContentFilter";
import ContentTabs from "./library/ContentTabs";
import ContentGrid from "./library/ContentGrid";
import { ContentItem, ContentLibraryProps } from "./types/content-library";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 9; // 3x3 grid

const ContentLibrary: React.FC<ContentLibraryProps> = ({ className }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const contentTypes = [
    { id: "all", label: "All Content" },
    { id: "pillar", label: "Pillar Content" },
    { id: "support", label: "Support Pages" },
    { id: "meta", label: "Meta Tags" },
    { id: "social", label: "Social Posts" }
  ];

  const fetchContentItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Error",
          description: "Failed to load content library",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setContentItems(data);
        setFilteredItems(data);
      }
      
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error("Error in fetchContentItems:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshContent = async () => {
    setIsRefreshing(true);
    await fetchContentItems();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchContentItems();
    
    const handleContentUpdated = () => {
      refreshContent();
    };
    
    window.addEventListener('content-updated', handleContentUpdated);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdated);
    };
  }, []);

  useEffect(() => {
    let filtered = contentItems;
    
    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(item => item.content_type === activeTab);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.topic_area && item.topic_area.toLowerCase().includes(term)) ||
        (item.keywords && item.keywords.some(k => k.toLowerCase().includes(term)))
      );
    }
    
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeTab, searchTerm, contentItems]);

  const copyContent = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('content')
        .eq('id', contentId)
        .single();

      if (error) throw error;

      if (data?.content) {
        await navigator.clipboard.writeText(data.content);
        toast({
          title: "Copied to clipboard",
          description: "Content copied successfully",
        });
      }
    } catch (error) {
      console.error("Error copying content:", error);
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      });
    }
  };

  const viewContent = (contentId: string, topicArea: string) => {
    // Navigate to content details view
    window.dispatchEvent(new CustomEvent('navigate-to-content-details', { 
      detail: { 
        contentIds: [contentId], 
        topicArea: topicArea || 'generated-content' 
      } 
    }));
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
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
    <div className={cn("space-y-6 w-full", className)}>
      <div className="flex items-center justify-between w-full">
        <h2 className="text-xl font-semibold">Content Library</h2>
        <ContentRefreshManager 
          isRefreshing={isRefreshing}
          onRefresh={refreshContent}
          lastRefreshed={lastRefreshed || undefined}
        />
      </div>
      
      <ContentFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ContentTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          contentTypes={contentTypes} 
        />
        
        <TabsContent value={activeTab} className="w-full mt-2">
          <ContentGrid 
            items={paginatedItems}
            isLoading={isLoading}
            copyContent={copyContent}
            viewContent={viewContent}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentLibrary;
