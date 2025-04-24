
import React, { useEffect, useState } from "react";
import { FileText, Tag, Share2, Eye, Copy, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RecentContentProps {
  className?: string;
}

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  created_at: string;
  keywords: string[];
  views?: number;
}

const getIcon = (type: string) => {
  switch (type) {
    case "pillar":
      return <FileText size={16} />;
    case "support":
      return <FileText size={16} />;
    case "meta":
      return <Tag size={16} />;
    case "social":
      return <Share2 size={16} />;
    default:
      return <FileText size={16} />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "pillar":
      return "Pillar Content";
    case "support":
      return "Support Page";
    case "meta":
      return "Meta Tags";
    case "social":
      return "Social Posts";
    default:
      return type;
  }
};

const getTypeClass = (type: string) => {
  switch (type) {
    case "pillar":
      return "bg-primary/10 text-primary";
    case "support":
      return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
    case "meta":
      return "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
    case "social":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    default:
      return "bg-primary/10 text-primary";
  }
};

const RecentContent: React.FC<RecentContentProps> = ({ className }) => {
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRecentContent = async () => {
    try {
      setIsLoading(true);
      // Fetch the latest content from Supabase
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
        // Transform the data to match our component's expected format
        const formattedContent = data.map(item => {
          // Generate a random view count for demo purposes
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
    
    // Listen for content updates from other components
    const handleContentUpdated = () => {
      fetchRecentContent();
    };
    
    window.addEventListener('content-updated', handleContentUpdated);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdated);
    };
  }, [toast]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes === 0) {
          return "Just now";
        }
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else if (diffHours === 1) {
        return "1 hour ago";
      } else {
        return `${diffHours} hours ago`;
      }
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const viewLibrary = () => {
    // Navigate to content tab
    const event = new CustomEvent('tab-change', { detail: { tab: 'content' } });
    window.dispatchEvent(event);
  };

  const viewContent = (contentId: string, topicArea: string) => {
    // Navigate to content details view
    window.dispatchEvent(new CustomEvent('navigate-to-content-details', { 
      detail: { contentIds: [contentId], topicArea: topicArea || 'generated-content' } 
    }));
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Content</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={viewLibrary}
        >
          View Library <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : recentContent.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No content created yet</p>
          <p className="text-sm mt-1">Use the content generator to create your first piece of content</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentContent.map((content) => (
            <div 
              key={content.id}
              className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => viewContent(content.id, content.content_type)}
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                getTypeClass(content.content_type)
              )}>
                {getIcon(content.content_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{content.title}</h4>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <span className="inline-flex items-center">
                    {getTypeLabel(content.content_type)}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(content.created_at)}</span>
                  {content.views && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center">
                        <Eye size={12} className="mr-1" />
                        {content.views}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {content.keywords && content.keywords.length > 0 ? (
                    content.keywords.slice(0, 3).map((keyword, i) => (
                      <span 
                        key={i}
                        className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No keywords</span>
                  )}
                  {content.keywords && content.keywords.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{content.keywords.length - 3} more</span>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyContent(content.id);
                  }}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentContent;
