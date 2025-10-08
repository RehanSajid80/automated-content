
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
      
      // Fetch from content_library
      const { data: libraryData, error: libraryError } = await supabase
        .from('content_library')
        .select('id, title, content_type, created_at, keywords, topic_area')
        .order('created_at', { ascending: false })
        .limit(10);

      if (libraryError) throw libraryError;

      // Fetch from misc (adjusted content)
      const { data: miscData, error: miscError } = await supabase
        .from('misc')
        .select('id, title, created_at, target_persona, target_format')
        .order('created_at', { ascending: false })
        .limit(10);

      if (miscError) throw miscError;

      // Combine and format both sources
      const allContent = [
        ...(libraryData || []).map(item => ({
          id: item.id,
          title: item.title || `Untitled ${getTypeLabel(item.content_type)}`,
          content_type: item.content_type,
          created_at: item.created_at,
          keywords: item.keywords || [],
          topic_area: item.topic_area,
          views: Math.floor(Math.random() * 150) + 10
        })),
        ...(miscData || []).map(item => ({
          id: item.id,
          title: item.title || 'Adjusted Content',
          content_type: 'misc',
          created_at: item.created_at,
          keywords: [],
          topic_area: item.target_persona || item.target_format,
          views: Math.floor(Math.random() * 150) + 10
        }))
      ];

      // Sort by created_at and limit to 4 most recent
      allContent.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentContent(allContent.slice(0, 4));
    } catch (error) {
      console.error("Error in fetchRecentContent:", error);
      toast({
        title: "Error",
        description: "Failed to load recent content",
        variant: "destructive",
      });
      setRecentContent([]);
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
