
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

const ContentLibrary: React.FC<ContentLibraryProps> = ({ className }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Library</h2>
        <ContentRefreshManager 
          isRefreshing={isRefreshing}
          onRefresh={refreshContent}
          lastRefreshed={lastRefreshed || undefined}
        />
      </div>
      
      <ContentFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <ContentTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          contentTypes={contentTypes} 
        />
        
        <TabsContent value={activeTab}>
          <ContentGrid 
            items={filteredItems}
            isLoading={isLoading}
            copyContent={copyContent}
            viewContent={viewContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentLibrary;
