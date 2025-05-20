
import React from "react";
import { Button } from "@/components/ui/button";
import { useRecentContent } from "./hooks/useRecentContent";
import { ContentListItem } from "./components/ContentListItem";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Library } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentContent = () => {
  const { recentContent, isLoading, error, refreshContent } = useRecentContent();
  const navigate = useNavigate();

  const handleCopyContent = async (contentId: string) => {
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

  const handleContentClick = (id: string, type: string) => {
    // Navigate to content details view with the selected content ID
    window.dispatchEvent(new CustomEvent('navigate-to-content-details', { 
      detail: { contentIds: [id], topicArea: 'recent-content' } 
    }));
  };

  const handleViewLibrary = () => {
    navigate("/library");
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Content</h3>
        <div className="p-6 text-center">
          <p className="text-red-500">Error loading recent content</p>
          <Button onClick={refreshContent} className="mt-2">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Content</h3>
        <Button variant="outline" onClick={handleViewLibrary}>
          <Library className="w-4 h-4 mr-2" />
          View Library
        </Button>
      </div>
      
      {recentContent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content has been created yet</p>
          <Button className="mt-4">Create Content</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentContent.slice(0, 5).map((content) => (
            <ContentListItem 
              key={content.id}
              content={content}
              onCopy={handleCopyContent}
              onClick={handleContentClick}
            />
          ))}
          
          {recentContent.length > 5 && (
            <div className="text-center pt-3">
              <Button variant="link" onClick={handleViewLibrary}>
                View all content
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentContent;
