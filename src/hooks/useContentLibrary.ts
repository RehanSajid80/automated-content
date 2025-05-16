
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  topic_area: string | null;
  created_at: string;
  updated_at: string;
  keywords: string[];
  is_saved: boolean;
}

export const useContentLibrary = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchContentItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load content library");
        return;
      }

      if (data) {
        setContentItems(data);
        setFilteredItems(data);
      }
      
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error("Error in fetchContentItems:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshContent = async () => {
    setIsRefreshing(true);
    await fetchContentItems();
    setIsRefreshing(false);
  };

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
        toast.success("Content copied to clipboard");
      }
    } catch (error) {
      console.error("Error copying content:", error);
      toast.error("Failed to copy content");
    }
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

  return {
    contentItems,
    filteredItems,
    isLoading,
    isRefreshing,
    lastRefreshed,
    activeTab,
    searchTerm,
    setActiveTab,
    setSearchTerm,
    refreshContent,
    copyContent,
    fetchContentItems
  };
};
