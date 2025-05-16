import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Tag, Share2, Search, Filter, RefreshCw, X, Copy, Eye } from "lucide-react";
import ContentRefreshManager from "./ContentViewRefreshManager";
import { cn } from "@/lib/utils";
import SocialPostsTab from "./SocialPostsTab";

interface ContentLibraryProps {
  className?: string;
}

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

const ContentLibrary: React.FC<ContentLibraryProps> = ({ className }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [libraryView, setLibraryView] = useState("general");
  const { toast } = useToast();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const contentTypes = [
    { id: "all", label: "All Content" },
    { id: "pillar", label: "Pillar Content" },
    { id: "support", label: "Support Pages" },
    { id: "meta", label: "Meta Tags" },
    { id: "social", label: "Social Posts" }
  ];

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
      
      <Tabs defaultValue="general" value={libraryView} onValueChange={setLibraryView}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Content</TabsTrigger>
          <TabsTrigger value="social">Social Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 overflow-auto">
              {contentTypes.map(type => (
                <TabsTrigger key={type.id} value={type.id}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 border rounded-lg border-dashed">
                <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No content found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? "Try adjusting your search terms" : "Create some content to see it here"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => viewContent(item.id, item.topic_area || '')}
                  >
                    <div className="p-4">
                      <div className="flex items-start mb-4">
                        <div className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3",
                          getTypeClass(item.content_type)
                        )}>
                          {getIcon(item.content_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{item.title || "Untitled Content"}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTypeLabel(item.content_type)} • {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {item.topic_area && (
                        <p className="text-xs text-muted-foreground mb-2">
                          <span className="font-medium">Topic:</span> {item.topic_area}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.keywords && item.keywords.length > 0 ? (
                          item.keywords.slice(0, 3).map((keyword, i) => (
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
                        {item.keywords && item.keywords.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{item.keywords.length - 3} more</span>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewContent(item.id, item.topic_area || '');
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyContent(item.id);
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Tabs>
        </TabsContent>

        <TabsContent value="social">
          <SocialPostsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentLibrary;
