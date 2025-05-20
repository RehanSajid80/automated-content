
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface ContentStats {
  pillarCount: number;
  supportCount: number;
  metaCount: number;
  socialCount: number;
}

export const useContentStats = () => {
  const [contentStats, setContentStats] = useState<ContentStats>({
    pillarCount: 0,
    supportCount: 0,
    metaCount: 0,
    socialCount: 0
  });

  const fetchContentStats = async () => {
    try {
      console.log('Fetching content stats for all content types...');
      
      // First, query for pillar content
      const { count: pillarCount, error: pillarError } = await supabase
        .from('content_library')
        .select('id', { count: 'exact' })
        .eq('content_type', 'pillar')
        .eq('is_saved', true);

      if (pillarError) throw pillarError;
      
      // Query for support content
      const { count: supportCount, error: supportError } = await supabase
        .from('content_library')
        .select('id', { count: 'exact' })
        .eq('content_type', 'support')
        .eq('is_saved', true);
        
      if (supportError) throw supportError;
      
      // Query for meta content
      const { count: metaCount, error: metaError } = await supabase
        .from('content_library')
        .select('id', { count: 'exact' })
        .eq('content_type', 'meta')
        .eq('is_saved', true);
        
      if (metaError) throw metaError;
      
      // Query for social content
      const { count: socialCount, error: socialError } = await supabase
        .from('content_library')
        .select('id', { count: 'exact' })
        .eq('content_type', 'social')
        .eq('is_saved', true);
        
      if (socialError) throw socialError;

      console.log('Content stats fetched:', { 
        pillarCount: pillarCount || 0, 
        supportCount: supportCount || 0, 
        metaCount: metaCount || 0, 
        socialCount: socialCount || 0 
      });

      setContentStats({
        pillarCount: pillarCount || 0,
        supportCount: supportCount || 0,
        metaCount: metaCount || 0,
        socialCount: socialCount || 0
      });
    } catch (error) {
      console.error('Error fetching content stats:', error);
    }
  };

  useEffect(() => {
    fetchContentStats();
    
    const handleContentUpdated = () => {
      console.log('Content updated event detected, refreshing stats...');
      fetchContentStats();
    };
    
    // Listen for the content-updated event from various components
    window.addEventListener('content-updated', handleContentUpdated);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdated);
    };
  }, []);

  return contentStats;
};
