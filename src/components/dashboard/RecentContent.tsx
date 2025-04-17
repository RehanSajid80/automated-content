
import React, { useEffect, useState } from "react";
import { FileText, Tag, Share2, Eye, Copy, ArrowRight, Clock } from "lucide-react";
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
  topic_area: string;
  content_type: string;
  content: string;
  created_at: string;
  keywords: string[];
  views?: number; // Optional as we might not have this data yet
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

// Function to format the relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const RecentContent: React.FC<RecentContentProps> = ({ className }) => {
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to fetch recent content from Supabase
  const fetchRecentContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match our ContentItem interface
      const formattedData = data.map((item): ContentItem => ({
        id: item.id,
        title: item.title || item.content?.substring(0, 80) || item.topic_area,
        topic_area: item.topic_area,
        content_type: item.content_type,
        content: item.content || "",
        created_at: item.created_at,
        keywords: item.keywords || [],
        views: Math.floor(Math.random() * 150) + 10 // Random view count for now
      }));
      
      setRecentContent(formattedData);
    } catch (err) {
      console.error("Error fetching recent content:", err);
      setError("Failed to load recent content");
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to realtime changes in the content_library table
  useEffect(() => {
    fetchRecentContent();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:content_library')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'content_library' },
        (payload) => {
          console.log('New content added:', payload);
          fetchRecentContent(); // Refresh the data when new content is added
        }
      )
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Function to copy content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
    }).catch(err => {
      console.error('Failed to copy content: ', err);
      toast({
        title: "Copy failed",
        description: "Could not copy content to clipboard",
        variant: "destructive"
      });
    });
  };
  
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Content</h3>
        <Button variant="ghost" size="sm" className="text-xs">
          View Library <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          Array(4).fill(0).map((_, i) => (
            <div 
              key={i}
              className="flex items-start space-x-4 p-4 rounded-lg border border-border bg-secondary/20 animate-pulse"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary"></div>
              <div className="flex-1">
                <div className="h-5 bg-secondary rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary rounded w-1/2 mb-2"></div>
                <div className="flex gap-1 mt-2">
                  <div className="h-4 bg-secondary rounded w-16"></div>
                  <div className="h-4 bg-secondary rounded w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
            {error}
          </div>
        ) : recentContent.length === 0 ? (
          // Empty state
          <div className="p-4 rounded-lg border border-border bg-secondary/20 text-center">
            <p className="text-muted-foreground">No content available yet</p>
            <p className="text-sm mt-1">Content you create will appear here</p>
          </div>
        ) : (
          // Content list
          recentContent.map((content) => (
            <div 
              key={content.id}
              className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                content.content_type === "pillar" && "bg-primary/10 text-primary",
                content.content_type === "support" && "bg-green-100 text-green-600",
                content.content_type === "meta" && "bg-purple-100 text-purple-600",
                content.content_type === "social" && "bg-blue-100 text-blue-600",
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
                  <span className="inline-flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatRelativeTime(content.created_at)}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="inline-flex items-center">
                    <Eye size={12} className="mr-1" />
                    {content.views}
                  </span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {content.keywords.slice(0, 3).map((keyword, i) => (
                    <span 
                      key={i}
                      className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                  {content.keywords.length > 3 && (
                    <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      +{content.keywords.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(content.content || content.title)}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentContent;
