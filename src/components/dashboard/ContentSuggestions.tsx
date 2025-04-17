
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
}

interface ContentSuggestionsProps {
  className?: string;
  keywords: KeywordData[];
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ 
  className,
  keywords = [] 
}) => {
  const { toast } = useToast();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  
  const storeContentInLibrary = async (suggestion: ContentSuggestion) => {
    try {
      const insertPromises = [
        ...suggestion.pillarContent.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'pillar',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        ),
        ...suggestion.supportPages.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'support',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        ),
        ...suggestion.metaTags.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'meta',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        ),
        ...suggestion.socialMedia.map(content => 
          supabase.from('content_library').insert({
            topic_area: suggestion.topicArea,
            content_type: 'social',
            content: content,
            reasoning: suggestion.reasoning,
            keywords: keywords
              .filter(kw => selectedKeywords.includes(kw.keyword))
              .map(kw => kw.keyword),
            title: content.length > 80 ? content.substring(0, 80) + '...' : content
          })
        )
      ];

      const results = await Promise.allSettled(insertPromises);

      const successCount = results.filter(result => 
        result.status === 'fulfilled' && 
        result.value.data !== null
      ).length;

      const failedCount = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.error !== null)
      ).length;

      if (successCount > 0) {
        toast({
          title: "Content Stored Successfully",
          description: `Stored ${successCount} content items for "${suggestion.topicArea}"`,
          variant: successCount === insertPromises.length ? "default" : "warning"
        });
      }

      if (failedCount > 0) {
        toast({
          title: "Partial Content Storage",
          description: `${failedCount} content items failed to store`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Comprehensive Error storing content:', error);
      toast({
        title: "Storage Error",
        description: "Failed to store content in library",
        variant: "destructive"
      });
    }
  };

  // Sample render method for the component
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <h3 className="text-lg font-semibold mb-4">AI Content Suggestions</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Generate content ideas based on your keyword research
      </p>
      
      {/* Component implementation would go here */}
      <div className="text-center text-muted-foreground py-8">
        This component is currently being implemented
      </div>
    </div>
  );
};

export default ContentSuggestions;
