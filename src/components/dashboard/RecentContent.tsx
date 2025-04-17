
import React, { useEffect, useState } from "react";
import { FileText, Tag, Share2, Eye, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RecentContentProps {
  className?: string;
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  date: string;
  keywords: string[];
  views: number;
}

const getIcon = (type: string) => {
  switch (type) {
    case "pillar":
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

const RecentContent: React.FC<RecentContentProps> = ({ className }) => {
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

      // Transform the data to match our component's expected format
      const formattedContent = data.map(item => {
        // Generate a random view count for demo purposes
        const randomViews = Math.floor(Math.random() * 150) + 10;
        
        // Format the date
        const date = new Date(item.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let dateString;
        if (diffDays === 0) {
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          if (diffHours === 0) {
            dateString = "Just now";
          } else if (diffHours === 1) {
            dateString = "1 hour ago";
          } else {
            dateString = `${diffHours} hours ago`;
          }
        } else if (diffDays === 1) {
          dateString = "Yesterday";
        } else if (diffDays < 7) {
          dateString = `${diffDays} days ago`;
        } else {
          dateString = date.toLocaleDateString();
        }

        return {
          id: item.id,
          title: item.title || `Untitled ${getTypeLabel(item.content_type)}`,
          type: item.content_type,
          date: dateString,
          keywords: item.keywords || [],
          views: randomViews
        };
      });

      setRecentContent(formattedContent);
    } catch (error) {
      console.error("Error in fetchRecentContent:", error);
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

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Content</h3>
        <Button variant="ghost" size="sm" className="text-xs">
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
              className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                content.type === "pillar" && "bg-primary/10 text-primary",
                content.type === "support" && "bg-green-100 text-green-600",
                content.type === "meta" && "bg-purple-100 text-purple-600",
                content.type === "social" && "bg-blue-100 text-blue-600",
              )}>
                {getIcon(content.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{content.title}</h4>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <span className="inline-flex items-center">
                    {getTypeLabel(content.type)}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{content.date}</span>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center">
                    <Eye size={12} className="mr-1" />
                    {content.views}
                  </span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {content.keywords.map((keyword, i) => (
                    <span 
                      key={i}
                      className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => copyContent(content.id)}
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
