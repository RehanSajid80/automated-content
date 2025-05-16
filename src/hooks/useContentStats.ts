
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
      const { count: pillarCount } = await supabase
        .from('content_library')
        .select('id', { count: 'exact' })
        .eq('content_type', 'pillar')
        .eq('is_saved', true);

      const { count: supportCount } = await supabase
        .from('content_library')
        .select('id', { count: 'exact' })
        .eq('content_type', 'support')
        .eq('is_saved', true);

      const { count: metaCount } = await supabase
        .from('content_library')
        .select('id', { count: 'exact' })
        .eq('content_type', 'meta')
        .eq('is_saved', true);

      // Get social posts count from the social_posts table instead
      const { count: socialCount } = await supabase
        .from('social_posts')
        .select('id', { count: 'exact' })
        .eq('is_saved', true);

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
      fetchContentStats();
    };
    
    window.addEventListener('content-updated', handleContentUpdated);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdated);
    };
  }, []);

  return contentStats;
};
