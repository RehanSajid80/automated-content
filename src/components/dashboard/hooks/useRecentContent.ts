
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContentItem } from "../types/recent-content";
import { getTypeLabel } from "../utils/content-type-utils";

export const useRecentContent = () => {
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecentContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content_library')
        .select('id, title, content_type, created_at, keywords')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Error",
          description: "Failed to load recent content",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        const formattedContent = data.map(item => {
          const randomViews = Math.floor(Math.random() * 150) + 10;
          return {
            id: item.id,
            title: item.title || `Untitled ${getTypeLabel(item.content_type)}`,
            content_type: item.content_type,
            created_at: item.created_at,
            keywords: item.keywords || [],
            views: randomViews
          };
        });

        setRecentContent(formattedContent);
      } else {
        setRecentContent([]);
      }
    } catch (error) {
      console.error("Error in fetchRecentContent:", error);
      toast({
        title: "Error",
        description: "Failed to load recent content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentContent();
    
    const handleContentUpdated = () => {
      fetchRecentContent();
    };
    
    window.addEventListener('content-updated', handleContentUpdated);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdated);
    };
  }, []);

  return {
    recentContent,
    isLoading,
    fetchRecentContent
  };
};
